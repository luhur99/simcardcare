import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalSims: 0,
    activeDevices: 0,
    customers: 0,
    warehouse: 0
  });

  useEffect(() => {
    setMounted(true);
    // Load stats from localStorage for now
    try {
      const stored = localStorage.getItem("sim_cards");
      if (stored) {
        const sims = JSON.parse(stored);
        const warehouse = sims.filter((s: any) => s.status === "WAREHOUSE").length;
        const installed = sims.filter((s: any) => s.status === "INSTALLED").length;
        
        setStats({
          totalSims: sims.length,
          activeDevices: installed,
          customers: 0,
          warehouse: warehouse
        });
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  if (!mounted) {
    return null;
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