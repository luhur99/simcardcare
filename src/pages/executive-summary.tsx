import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Download, TrendingDown, Ghost, DollarSign, Calendar } from "lucide-react";
import { simService } from "@/services/simService";
import type { SimCard } from "@/lib/supabase";

interface LeakageMetrics {
  totalMTDLeakage: number;
  ghostSimCount: number;
  ghostSimCost: number;
  topLeakageSims: LeakageSimCard[];
}

interface LeakageSimCard {
  iccid: string;
  phoneNumber: string | null;
  status: string;
  provider: string;
  daysInStatus: number;
  dailyRate: number;
  totalCost: number;
  reason: string;
}

export default function ExecutiveSummary() {
  const [metrics, setMetrics] = useState<LeakageMetrics>({
    totalMTDLeakage: 0,
    ghostSimCount: 0,
    ghostSimCost: 0,
    topLeakageSims: []
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const sims = await simService.getSimCards();
      const calculatedMetrics = calculateLeakageMetrics(sims);
      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLeakageMetrics = (sims: SimCard[]): LeakageMetrics => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate Ghost SIM Cost (ACTIVATED but not INSTALLED)
    const ghostSims = sims.filter(sim => sim.status === "ACTIVATED");
    const ghostSimCost = ghostSims.reduce((total, sim) => {
      const activationDate = sim.activation_date ? new Date(sim.activation_date) : null;
      if (!activationDate) return total;
      
      const daysSinceActivation = Math.floor((now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));
      const dailyRate = sim.monthly_cost / 30;
      return total + (daysSinceActivation * dailyRate);
    }, 0);

    // Calculate overlap leakage (multiple SIMs on same IMEI in a period)
    const leakageSims: LeakageSimCard[] = [];
    
    // Find all SIMs with leakage scenarios
    sims.forEach(sim => {
      let leakageDays = 0;
      let reason = "";
      
      // Scenario 1: Ghost SIM (ACTIVATED but not INSTALLED)
      if (sim.status === "ACTIVATED" && sim.activation_date) {
        const activationDate = new Date(sim.activation_date);
        leakageDays = Math.floor((now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));
        reason = "Ghost SIM - Activated but not installed";
      }
      
      // Scenario 2: Grace Period (should be paying but in grace)
      if (sim.status === "GRACE_PERIOD" && sim.installation_date) {
        const installDate = new Date(sim.installation_date);
        const graceDays = Math.floor((now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24));
        leakageDays = graceDays;
        reason = "Grace Period - Should be billing";
      }
      
      // Scenario 3: Recently deactivated (was billing until deactivation)
      if (sim.status === "DEACTIVATED" && sim.deactivation_date && sim.installation_date) {
        const deactivationDate = new Date(sim.deactivation_date);
        if (deactivationDate >= monthStart) {
          const installDate = new Date(sim.installation_date);
          const daysActive = Math.floor((deactivationDate.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24));
          leakageDays = daysActive;
          reason = "Recently deactivated - MTD cost";
        }
      }
      
      if (leakageDays > 0) {
        const dailyRate = sim.monthly_cost / 30;
        leakageSims.push({
          iccid: sim.iccid,
          phoneNumber: sim.phone_number,
          status: sim.status,
          provider: sim.provider,
          daysInStatus: leakageDays,
          dailyRate: dailyRate,
          totalCost: leakageDays * dailyRate,
          reason: reason
        });
      }
    });

    // Sort by total cost descending
    leakageSims.sort((a, b) => b.totalCost - a.totalCost);

    // Calculate total MTD leakage
    const totalMTDLeakage = leakageSims.reduce((sum, sim) => sum + sim.totalCost, 0);

    return {
      totalMTDLeakage,
      ghostSimCount: ghostSims.length,
      ghostSimCost,
      topLeakageSims: leakageSims.slice(0, 10)
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportAuditReport = async () => {
    setExporting(true);
    try {
      const sims = await simService.getSimCards();
      const allLeakageSims = calculateLeakageMetrics(sims).topLeakageSims;
      
      // Prepare CSV data
      const headers = [
        "No SIM Card",
        "ICCID",
        "Phone Number",
        "Status",
        "Provider",
        "Days in Status",
        "Daily Rate (IDR)",
        "Total Cost (IDR)",
        "Leakage Reason"
      ];
      
      const csvRows = [
        headers.join(","),
        ...allLeakageSims.map(sim => [
          sim.phoneNumber || "N/A",
          sim.iccid,
          sim.phoneNumber || "N/A",
          sim.status,
          sim.provider,
          sim.daysInStatus.toString(),
          sim.dailyRate.toFixed(2),
          sim.totalCost.toFixed(2),
          `"${sim.reason}"`
        ].join(","))
      ];
      
      // Add summary at the end
      csvRows.push("");
      csvRows.push("SUMMARY");
      csvRows.push(`Total MTD Leakage,${metrics.totalMTDLeakage.toFixed(2)}`);
      csvRows.push(`Ghost SIM Count,${metrics.ghostSimCount}`);
      csvRows.push(`Ghost SIM Cost,${metrics.ghostSimCost.toFixed(2)}`);
      csvRows.push(`Export Date,${new Date().toISOString()}`);
      
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().split("T")[0];
      link.setAttribute("href", url);
      link.setAttribute("download", `BKT-SimCare-Audit-Report-${timestamp}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting audit report:", error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading executive summary...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title="Executive Summary - BKT SimCare"
        description="Financial KPI and leakage analysis for SIM card management"
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Executive Summary</h1>
            <p className="text-muted-foreground mt-2">
              Financial KPI & Leakage Analysis - Month to Date
            </p>
          </div>
          <Button onClick={exportAuditReport} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export Audit Report"}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Total MTD Leakage */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Financial Leakage (MTD)
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(metrics.totalMTDLeakage)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Accumulated cost from overlapping and inactive SIMs
              </p>
            </CardContent>
          </Card>

          {/* Ghost SIM Count */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ghost SIM Cards
              </CardTitle>
              <Ghost className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.ghostSimCount} <span className="text-sm font-normal text-muted-foreground">cards</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Activated but not yet installed
              </p>
            </CardContent>
          </Card>

          {/* Ghost SIM Cost */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ghost SIM Cost
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(metrics.ghostSimCost)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total cost from {metrics.ghostSimCount} ghost SIM cards
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top 10 High-Leakage SIM Cards */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Top 10 High-Leakage SIM Cards
                </CardTitle>
                <CardDescription className="mt-2">
                  SIM cards with highest financial leakage this month
                </CardDescription>
              </div>
              <Badge variant="destructive" className="text-sm">
                {metrics.topLeakageSims.length} cards analyzed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {metrics.topLeakageSims.length === 0 ? (
              <div className="text-center py-12">
                <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No leakage detected this month</p>
                <p className="text-sm text-muted-foreground mt-1">All SIM cards are properly managed</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>No SIM Card</TableHead>
                      <TableHead>ICCID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead className="text-right">Days</TableHead>
                      <TableHead className="text-right">Daily Rate</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.topLeakageSims.map((sim, index) => (
                      <TableRow key={sim.iccid}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{sim.phoneNumber || "-"}</TableCell>
                        <TableCell className="font-mono text-sm">{sim.iccid}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              sim.status === "ACTIVATED" ? "default" :
                              sim.status === "GRACE_PERIOD" ? "secondary" :
                              sim.status === "DEACTIVATED" ? "destructive" :
                              "outline"
                            }
                          >
                            {sim.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{sim.provider}</TableCell>
                        <TableCell className="text-right">{sim.daysInStatus}</TableCell>
                        <TableCell className="text-right">{formatCurrency(sim.dailyRate)}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(sim.totalCost)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs">
                          {sim.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Report Period:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long" })} (MTD)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Report Generated:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString("id-ID", { 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total SIM Cards Analyzed:</span>
              <span className="font-medium">{metrics.topLeakageSims.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}