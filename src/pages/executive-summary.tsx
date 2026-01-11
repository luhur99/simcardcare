import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Download, TrendingDown, DollarSign, Calendar, Ghost } from "lucide-react";
import { simService, calculateDailyBurden, calculateGracePeriodCost, getGracePeriodStatus, calculateFreePulsaCost } from "@/services/simService";
import type { SimCard } from "@/lib/supabase";

interface OverlapSimCard {
  phoneNumber: string;
  iccid: string;
  provider: string;
  status: string;
  overlap1Days: number;
  overlap1Cost: number;
  overlap2Days: number;
  overlap2Cost: number;
  totalOverlapCost: number;
  imei: string | null;
}

interface PotentialLossSimCard {
  phoneNumber: string;
  iccid: string;
  provider: string;
  status: string;
  daysInStatus: number;
  dailyRate: number;
  totalCost: number;
  reason: string;
  imei: string | null;
}

interface FreePulsaSimCard {
  phoneNumber: string;
  iccid: string;
  provider: string;
  freePulsaMonths: number;
  monthlyPulsaCost: number;
  totalFreePulsaCost: number;
  remainingMonths: number;
  imei: string | null;
}

export default function ExecutiveSummary() {
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const sims = await simService.getSimCards();
      setSimCards(sims);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Overlap Cards (from daily burden)
  const overlapCards = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    const cards: OverlapSimCard[] = [];

    simCards.forEach(sim => {
      const burden = calculateDailyBurden(sim);
      
      // Check if SIM was active in selected month
      const activationDate = sim.activation_date ? new Date(sim.activation_date) : null;
      const deactivationDate = sim.deactivation_date ? new Date(sim.deactivation_date) : null;
      
      const isActiveInMonth = activationDate && 
        activationDate <= monthEnd && 
        (!deactivationDate || deactivationDate >= monthStart);

      if (isActiveInMonth && (burden.overlap_1_cost > 0 || burden.overlap_2_cost > 0)) {
        cards.push({
          phoneNumber: sim.phone_number,
          iccid: sim.iccid || "N/A",
          provider: sim.provider,
          status: sim.status,
          overlap1Days: burden.overlap_1_days,
          overlap1Cost: burden.overlap_1_cost,
          overlap2Days: burden.overlap_2_days,
          overlap2Cost: burden.overlap_2_cost,
          totalOverlapCost: burden.overlap_1_cost + burden.overlap_2_cost,
          imei: sim.current_imei
        });
      }
    });

    return cards.sort((a, b) => b.totalOverlapCost - a.totalOverlapCost);
  }, [simCards, selectedMonth]);

  // Calculate Potential Loss Cards (Grace Period + Ghost SIM)
  const potentialLossCards = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    const cards: PotentialLossSimCard[] = [];

    simCards.forEach(sim => {
      let cost = 0;
      let days = 0;
      let reason = "";

      // Grace Period SIMs
      if (sim.status === "GRACE_PERIOD" && sim.grace_period_start_date) {
        const graceStartDate = new Date(sim.grace_period_start_date);
        if (graceStartDate >= monthStart && graceStartDate <= monthEnd) {
          const now = new Date();
          days = Math.floor((now.getTime() - graceStartDate.getTime()) / (1000 * 60 * 60 * 24));
          const dailyRate = sim.monthly_cost / 30;
          cost = days * dailyRate;
          reason = "Grace Period - Seharusnya sudah billing";
        }
      }

      // Ghost SIM (ACTIVATED but not INSTALLED)
      if (sim.status === "ACTIVATED" && !sim.installation_date && sim.activation_date) {
        const activationDate = new Date(sim.activation_date);
        if (activationDate >= monthStart && activationDate <= monthEnd) {
          const now = new Date();
          days = Math.floor((now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));
          const dailyRate = sim.monthly_cost / 30;
          cost = days * dailyRate;
          reason = "Ghost SIM - Activated tapi tidak terinstall";
        }
      }

      if (cost > 0) {
        cards.push({
          phoneNumber: sim.phone_number,
          iccid: sim.iccid || "N/A",
          provider: sim.provider,
          status: sim.status,
          daysInStatus: days,
          dailyRate: sim.monthly_cost / 30,
          totalCost: cost,
          reason,
          imei: sim.current_imei
        });
      }
    });

    return cards.sort((a, b) => b.totalCost - a.totalCost);
  }, [simCards, selectedMonth]);

  // Calculate Free Pulsa Cards - using function from simService
  const freePulsaCosts = useMemo(() => {
    const costs: Array<{
      phoneNumber: string;
      iccid: string;
      provider: string;
      totalFreeMonths: number;
      monthsElapsed: number;
      monthlyCost: number;
      costIncurred: number;
      imei: string | null;
    }> = [];

    simCards.forEach(sim => {
      if (sim.free_pulsa_months && sim.installation_date && sim.monthly_cost) {
        const calc = calculateFreePulsaCost(sim);
        
        // Only include if there's cost incurred (months have elapsed)
        if (calc.costIncurred > 0) {
          costs.push({
            phoneNumber: sim.phone_number,
            iccid: sim.iccid || "N/A",
            provider: sim.provider,
            totalFreeMonths: calc.totalFreeMonths,
            monthsElapsed: calc.monthsElapsed,
            monthlyCost: sim.monthly_cost,
            costIncurred: calc.costIncurred,
            imei: sim.current_imei
          });
        }
      }
    });

    return costs.sort((a, b) => b.costIncurred - a.costIncurred);
  }, [simCards]);

  // Calculate Summary Metrics
  const metrics = useMemo(() => {
    const totalOverlapCost = overlapCards.reduce((sum, card) => sum + card.totalOverlapCost, 0);
    const totalPotentialLoss = potentialLossCards.reduce((sum, card) => sum + card.totalCost, 0);
    const totalFreePulsaCost = freePulsaCosts.reduce((sum, card) => sum + card.costIncurred, 0);

    const gracePeriodCards = potentialLossCards.filter(c => c.status === "GRACE_PERIOD");
    const ghostCards = potentialLossCards.filter(c => c.status === "ACTIVATED");

    return {
      totalOverlapCost,
      totalPotentialLoss,
      totalFreePulsaCost,
      gracePeriodCount: gracePeriodCards.length,
      gracePeriodCost: gracePeriodCards.reduce((sum, c) => sum + c.totalCost, 0),
      ghostCount: ghostCards.length,
      ghostCost: ghostCards.reduce((sum, c) => sum + c.totalCost, 0)
    };
  }, [overlapCards, potentialLossCards, freePulsaCosts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString("id-ID", { year: "numeric", month: "long" });
      options.push({ value, label });
    }
    
    return options;
  };

  const exportToExcel = (data: any[], filename: string, headers: string[]) => {
    const csvRows = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const key = header.toLowerCase().replace(/ /g, "_");
          const value = row[key];
          return typeof value === "string" && value.includes(",") ? `"${value}"` : value;
        }).join(",")
      )
    ];

    csvRows.push("");
    csvRows.push(`Export Date,${new Date().toISOString()}`);
    csvRows.push(`Period,${selectedMonth}`);

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}-${selectedMonth}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOverlapData = () => {
    const data = overlapCards.map(card => ({
      no_sim_card: card.phoneNumber,
      iccid: card.iccid,
      provider: card.provider,
      status: card.status,
      imei: card.imei || "-",
      overlap_1_days: card.overlap1Days,
      overlap_1_cost: card.overlap1Cost.toFixed(2),
      overlap_2_days: card.overlap2Days,
      overlap_2_cost: card.overlap2Cost.toFixed(2),
      total_overlap_cost: card.totalOverlapCost.toFixed(2)
    }));

    exportToExcel(
      data,
      "Laporan-Biaya-Overlap",
      ["No SIM Card", "ICCID", "Provider", "Status", "IMEI", "Overlap 1 Days", "Overlap 1 Cost", "Overlap 2 Days", "Overlap 2 Cost", "Total Overlap Cost"]
    );
  };

  const exportPotentialLossData = () => {
    const data = potentialLossCards.map(card => ({
      no_sim_card: card.phoneNumber,
      iccid: card.iccid,
      provider: card.provider,
      status: card.status,
      imei: card.imei || "-",
      days_in_status: card.daysInStatus,
      daily_rate: card.dailyRate.toFixed(2),
      total_cost: card.totalCost.toFixed(2),
      reason: card.reason
    }));

    exportToExcel(
      data,
      "Laporan-Potensi-Kerugian",
      ["No SIM Card", "ICCID", "Provider", "Status", "IMEI", "Days in Status", "Daily Rate", "Total Cost", "Reason"]
    );
  };

  const exportFreePulsaData = () => {
    const data = freePulsaCosts.map(card => ({
      no_sim_card: card.phoneNumber,
      iccid: card.iccid,
      provider: card.provider,
      imei: card.imei || "-",
      free_pulsa_months: card.totalFreeMonths,
      monthly_pulsa_cost: card.monthlyCost.toFixed(2),
      months_elapsed: card.monthsElapsed,
      total_free_pulsa_cost: card.costIncurred.toFixed(2)
    }));

    exportToExcel(
      data,
      "Laporan-Biaya-Free-Pulsa",
      ["No SIM Card", "ICCID", "Provider", "IMEI", "Free Pulsa Months", "Monthly Pulsa Cost", "Months Elapsed", "Total Free Pulsa Cost"]
    );
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
        description="Financial KPI and cost analysis for SIM card management"
      />
      
      <div className="space-y-6">
        {/* Header with Month Filter */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Executive Summary</h1>
            <p className="text-muted-foreground mt-2">
              Analisis Biaya & Potensi Kerugian SIM Card
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards - 3 Main Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* 1. Total Financial Leakage (Overlap) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Financial Leakage
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(metrics.totalOverlapCost)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Biaya overlap dari {overlapCards.length} kartu
              </p>
            </CardContent>
          </Card>

          {/* 2. Berpotensi Kerugian */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Berpotensi Kerugian
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(metrics.totalPotentialLoss)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                <div>Grace Period: {metrics.gracePeriodCount} kartu ({formatCurrency(metrics.gracePeriodCost)})</div>
                <div>Ghost SIM: {metrics.ghostCount} kartu ({formatCurrency(metrics.ghostCost)})</div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Biaya Free Pulsa Berjalan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Biaya Free Pulsa Berjalan
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(metrics.totalFreePulsaCost)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {freePulsaCards.length} kartu dengan free pulsa aktif
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Section 1: Biaya Overlap */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  1. Total Financial Leakage - Biaya Overlap
                </CardTitle>
                <CardDescription className="mt-2">
                  Biaya overlap karena multiple SIM pada IMEI yang sama (Overlap 1 + Overlap 2)
                </CardDescription>
              </div>
              <Button onClick={exportOverlapData} disabled={overlapCards.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {overlapCards.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Tidak ada biaya overlap di bulan ini</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>No SIM Card</TableHead>
                      <TableHead>ICCID</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IMEI</TableHead>
                      <TableHead className="text-right">Overlap 1 Days</TableHead>
                      <TableHead className="text-right">Overlap 1 Cost</TableHead>
                      <TableHead className="text-right">Overlap 2 Days</TableHead>
                      <TableHead className="text-right">Overlap 2 Cost</TableHead>
                      <TableHead className="text-right">Total Overlap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overlapCards.map((card, index) => (
                      <TableRow key={`${card.phoneNumber}-${index}`}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-mono">{card.phoneNumber}</TableCell>
                        <TableCell className="font-mono text-sm">{card.iccid}</TableCell>
                        <TableCell>{card.provider}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{card.status}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{card.imei || "-"}</TableCell>
                        <TableCell className="text-right">{card.overlap1Days}</TableCell>
                        <TableCell className="text-right">{formatCurrency(card.overlap1Cost)}</TableCell>
                        <TableCell className="text-right">{card.overlap2Days}</TableCell>
                        <TableCell className="text-right">{formatCurrency(card.overlap2Cost)}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(card.totalOverlapCost)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell colSpan={10} className="text-right">Total:</TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(metrics.totalOverlapCost)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Berpotensi Kerugian */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                  2. Berpotensi Kerugian (Grace Period + Ghost SIM)
                </CardTitle>
                <CardDescription className="mt-2">
                  SIM dalam masa grace period & ghost SIM yang belum terinstall
                </CardDescription>
              </div>
              <Button onClick={exportPotentialLossData} disabled={potentialLossCards.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {potentialLossCards.length === 0 ? (
              <div className="text-center py-12">
                <Ghost className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Tidak ada potensi kerugian di bulan ini</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>No SIM Card</TableHead>
                      <TableHead>ICCID</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IMEI</TableHead>
                      <TableHead className="text-right">Days</TableHead>
                      <TableHead className="text-right">Daily Rate</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {potentialLossCards.map((card, index) => (
                      <TableRow key={`${card.phoneNumber}-${index}`}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-mono">{card.phoneNumber}</TableCell>
                        <TableCell className="font-mono text-sm">{card.iccid}</TableCell>
                        <TableCell>{card.provider}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={card.status === "GRACE_PERIOD" ? "secondary" : "destructive"}
                          >
                            {card.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{card.imei || "-"}</TableCell>
                        <TableCell className="text-right">{card.daysInStatus}</TableCell>
                        <TableCell className="text-right">{formatCurrency(card.dailyRate)}</TableCell>
                        <TableCell className="text-right font-semibold text-orange-600">
                          {formatCurrency(card.totalCost)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {card.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell colSpan={8} className="text-right">Total:</TableCell>
                      <TableCell className="text-right text-orange-600">
                        {formatCurrency(metrics.totalPotentialLoss)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Biaya Free Pulsa Berjalan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  3. Biaya Free Pulsa Berjalan
                </CardTitle>
                <CardDescription className="mt-2">
                  Total biaya free pulsa yang masih berjalan untuk semua kartu
                </CardDescription>
              </div>
              <Button onClick={exportFreePulsaData} disabled={freePulsaCards.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {freePulsaCards.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Tidak ada free pulsa berjalan saat ini</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>No SIM Card</TableHead>
                      <TableHead>ICCID</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>IMEI</TableHead>
                      <TableHead className="text-right">Total Free Pulsa</TableHead>
                      <TableHead>Bulan Berjalan</TableHead>
                      <TableHead className="text-right">Biaya/Bulan</TableHead>
                      <TableHead className="text-right">Total Biaya Free Pulsa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {freePulsaCosts.map((item, index) => (
                      <TableRow key={`${item.phoneNumber}-${index}`}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-mono">{item.phoneNumber}</TableCell>
                        <TableCell className="font-mono text-sm">{item.iccid}</TableCell>
                        <TableCell>{item.provider}</TableCell>
                        <TableCell className="font-mono text-sm">{item.imei || "-"}</TableCell>
                        <TableCell className="text-right">{item.totalFreeMonths} bulan</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.monthsElapsed} bulan</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.monthlyCost)}</TableCell>
                        <TableCell className="text-right font-semibold text-blue-600">
                          {formatCurrency(item.costIncurred)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell colSpan={8} className="text-right">Total:</TableCell>
                      <TableCell className="text-right text-blue-600">
                        {formatCurrency(metrics.totalFreePulsaCost)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informasi Laporan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Periode:</span>
              <span className="font-medium">
                {new Date(selectedMonth + "-01").toLocaleDateString("id-ID", { 
                  year: "numeric", 
                  month: "long" 
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Generate:</span>
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
              <span className="text-muted-foreground">Total SIM Cards:</span>
              <span className="font-medium">{simCards.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}