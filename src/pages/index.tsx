import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/lib/supabase";

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

  // Calculate monthly data for charts
  const chartData = useMemo(() => {
    if (simCards.length === 0) return [];

    // Get last 6 months (current month + 5 months back)
    const months: string[] = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7); // "2026-01"
      months.push(monthStr);
    }

    // Calculate stats for each month
    const monthlyData = months.map(month => {
      const monthDate = new Date(month + "-01");
      const year = monthDate.getFullYear();
      const monthIndex = monthDate.getMonth();
      
      const monthStart = new Date(year, monthIndex, 1, 0, 0, 0, 0);
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

      // Format month name
      const monthName = monthDate.toLocaleDateString("id-ID", { month: "short", year: "numeric" });

      return {
        month: monthName,
        warehouse: warehouseCount,
        deactivated: deactivatedCount
      };
    });

    return monthlyData;
  }, [simCards]);

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