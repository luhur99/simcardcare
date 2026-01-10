import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { simService } from "@/services/simService";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSims: 0,
    activeDevices: 0,
    customers: 0,
    warehouse: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await simService.getStats();
      setStats(data || { totalSims: 0, activeDevices: 0, customers: 0, warehouse: 0 });
    } catch (err: any) {
      console.error("Error loading stats:", err);
      setError(err.message || "Failed to load stats");
      setStats({ totalSims: 0, activeDevices: 0, customers: 0, warehouse: 0 });
    } finally {
      setLoading(false);
    }
  };

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

        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-red-600">Error: {error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total SIM Cards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSims}</div>
                <p className="text-xs text-muted-foreground">
                  Active SIM cards in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeDevices}</div>
                <p className="text-xs text-muted-foreground">
                  Devices currently in use
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.customers}</div>
                <p className="text-xs text-muted-foreground">
                  Total registered customers
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
                  SIM cards available
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Navigate to different sections of the system:
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                <Link 
                  href="/sim-cards" 
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium">SIM Cards</div>
                  <div className="text-sm text-muted-foreground">
                    Manage your SIM card inventory
                  </div>
                </Link>
                <Link 
                  href="/devices" 
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium">Devices</div>
                  <div className="text-sm text-muted-foreground">
                    Track device assignments
                  </div>
                </Link>
                <Link 
                  href="/customers" 
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium">Customers</div>
                  <div className="text-sm text-muted-foreground">
                    Manage customer information
                  </div>
                </Link>
                <Link 
                  href="/history" 
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium">History</div>
                  <div className="text-sm text-muted-foreground">
                    View transaction history
                  </div>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}