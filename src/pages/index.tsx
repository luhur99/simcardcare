import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/lib/supabase";
import { Calendar } from "lucide-react";
import { getMonthsBackRangeWIB, createWIBDate } from "@/lib/dateUtils";

interface SimCard {
  id: string;
  iccid: string;
  phone_number: string;
  status: string;
  activation_date: string | null;
  installation_date: string | null;
  deactivation_date: string | null;
  created_at: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date range state - default to last 6 months (WIB timezone)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    return getMonthsBackRangeWIB(5); // Last 6 months (current + 5 back)
  });

  useEffect(() => {
    setMounted(true);
    loadSimCards();
  }, []);

  const loadSimCards = async () => {
    try {
      const { data, error } = await supabase
        .from("sim_cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setSimCards(data);
      }
    } catch (err) {
      console.error("Error loading SIM cards:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalSims = simCards.length;
    const warehouse = simCards.filter(s => s.status === "WAREHOUSE").length;
    const ghost = simCards.filter(s => s.status === "ACTIVATED" && !s.installation_date).length;
    const installed = simCards.filter(s => s.status === "INSTALLED").length;
    const gracePeriod = simCards.filter(s => s.status === "GRACE_PERIOD").length;
    const deactivated = simCards.filter(s => s.status === "DEACTIVATED").length;

    return {
      totalSims,
      warehouse,
      ghost,
      installed,
      gracePeriod,
      deactivated
    };
  }, [simCards]);

  // Calculate monthly data for charts based on date range (WIB timezone)
  const chartData = useMemo(() => {
    if (simCards.length === 0) return [];

    // Parse date range using WIB timezone
    const startDate = createWIBDate(dateRange.start);
    const endDate = createWIBDate(dateRange.end);

    // Generate all months between start and end date (inclusive)
    const months: string[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    // Only generate months up to and including the end date month
    while (current <= end) {
      const monthStr = current.toISOString().slice(0, 7); // "2026-01"
      months.push(monthStr);
      current.setMonth(current.getMonth() + 1);
    }

    // Calculate stats for each month
    const monthlyData = months.map(month => {
      const monthDate = new Date(month + "-01");
      const year = monthDate.getFullYear();
      const monthIndex = monthDate.getMonth();
      
      // WIB timezone boundaries for the month
      const monthStart = createWIBDate(`${year}-${String(monthIndex + 1).padStart(2, '0')}-01`);
      const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

      // Count SIMs that entered warehouse this month
      const warehouseCount = simCards.filter(sim => {
        if (!sim.created_at) return false;
        const createdDate = new Date(sim.created_at);
        return createdDate >= monthStart && createdDate <= monthEnd && sim.status === "WAREHOUSE";
      }).length;

      // Count SIMs that were deactivated this month
      const deactivatedCount = simCards.filter(sim => {
        if (!sim.deactivation_date) return false;
        const deactivatedDate = new Date(sim.deactivation_date);
        return deactivatedDate >= monthStart && deactivatedDate <= monthEnd;
      }).length;

      // Format month name in Indonesian (WIB timezone)
      const monthName = monthDate.toLocaleDateString("id-ID", { 
        month: "short", 
        year: "numeric",
        timeZone: "Asia/Jakarta"
      });

      return {
        month: monthName,
        warehouse: warehouseCount,
        deactivated: deactivatedCount
      };
    });

    return monthlyData;
  }, [simCards, dateRange]);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <SEO 
          title="Dashboard - BKT-SimCare"
          description="SIM Card Management Dashboard"
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg">Loading dashboard...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title="Dashboard - BKT-SimCare"
        description="SIM Card Management Dashboard"
      />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to BKT-SimCare Management System
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total SIM Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSims}</div>
              <p className="text-xs text-muted-foreground">
                Semua simcard terdata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Warehouse Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.warehouse}</div>
              <p className="text-xs text-muted-foreground">
                Status WAREHOUSE
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ghost SIM Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ghost}</div>
              <p className="text-xs text-muted-foreground">
                Aktif belum diinstal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Installed SIM Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.installed}</div>
              <p className="text-xs text-muted-foreground">
                Status INSTALLED
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Grace Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.gracePeriod}</div>
              <p className="text-xs text-muted-foreground">
                Status GRACE_PERIOD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Deactivated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deactivated}</div>
              <p className="text-xs text-muted-foreground">
                Status DEACTIVATED
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Filter Periode Grafik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Warehouse Chart */}
          <Card>
            <CardHeader>
              <CardTitle>SIM Cards Masuk (Warehouse) - Per Bulan</CardTitle>
              <p className="text-sm text-muted-foreground">
                Jumlah kartu simcard yang masuk ke warehouse
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ value: 'Jumlah (Qty)', angle: -90, position: 'insideLeft' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} cards`, 'Warehouse']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="warehouse" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Warehouse (Qty)"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Deactivated Chart */}
          <Card>
            <CardHeader>
              <CardTitle>SIM Cards Deactivated - Per Bulan</CardTitle>
              <p className="text-sm text-muted-foreground">
                Jumlah kartu simcard yang deactivated
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ value: 'Jumlah (Qty)', angle: -90, position: 'insideLeft' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} cards`, 'Deactivated']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="deactivated" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Deactivated (Qty)"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}