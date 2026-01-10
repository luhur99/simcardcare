import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CreditCard, 
  Smartphone, 
  Users, 
  Activity,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { simService } from "@/services/simService";

export default function Home() {
  const [stats, setStats] = useState({
    totalSims: 0,
    activeDevices: 0,
    customers: 0,
    warehouse: 0
  });

  useEffect(() => {
    simService.getStats().then(setStats);
  }, []);

  const statsCards = [
    {
      title: "Total SIM Cards",
      value: stats.totalSims.toString(),
      change: "+0 this month",
      icon: CreditCard,
      color: "text-blue-600"
    },
    {
      title: "Active Devices",
      value: stats.activeDevices.toString(),
      change: "+0 this month",
      icon: Smartphone,
      color: "text-green-600"
    },
    {
      title: "Customers",
      value: stats.customers.toString(),
      change: "+0 this month",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "In Warehouse",
      value: stats.warehouse.toString(),
      change: "Ready to activate",
      icon: Activity,
      color: "text-orange-600"
    }
  ];

  const recentActivity = [
    {
      action: "System Initialized",
      description: "Database schema created with all tables",
      time: "Just now",
      status: "success"
    },
    {
      action: "Sample Data Added",
      description: "2 customers, 2 devices, 2 SIM cards",
      time: "Just now",
      status: "info"
    }
  ];

  const statusBreakdown = [
    { status: "WAREHOUSE", count: 2, color: "bg-gray-500" },
    { status: "ACTIVATED", count: 0, color: "bg-blue-500" },
    { status: "INSTALLED", count: 0, color: "bg-green-500" },
    { status: "BILLING", count: 0, color: "bg-purple-500" },
    { status: "GRACE_PERIOD", count: 0, color: "bg-yellow-500" },
    { status: "DEACTIVATED", count: 0, color: "bg-red-500" }
  ];

  return (
    <Layout>
      <SEO 
        title="Dashboard - BKT-SimCare"
        description="SIM Card Management System Dashboard"
      />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to BKT-SimCare SIM Card Management System
          </p>
        </div>

        {/* Supabase Connection Notice */}
        <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
              <AlertCircle className="h-5 w-5" />
              Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700 dark:text-orange-400">
            <p className="mb-2">
              <strong>Supabase is not connected.</strong> To activate the full application:
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Click the "Supabase" button in the Softgen navbar</li>
              <li>Connect your Supabase project</li>
              <li>Open the SQL Editor in your Supabase dashboard</li>
              <li>Run the SQL script from <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">supabase/schema.sql</code></li>
              <li>Refresh this page to see live data</li>
            </ol>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* SIM Card Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>SIM Card Status</CardTitle>
              <CardDescription>Breakdown by lifecycle stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statusBreakdown.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium">{item.status}</span>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full ${
                      activity.status === "success" ? "bg-green-500" : "bg-blue-500"
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>What BKT-SimCare can do for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  SIM Lifecycle Management
                </h4>
                <p className="text-sm text-muted-foreground">
                  Track SIM cards through WAREHOUSE → ACTIVATED → INSTALLED → BILLING → GRACE_PERIOD → DEACTIVATED
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  IMEI Protection
                </h4>
                <p className="text-sm text-muted-foreground">
                  Unique constraint prevents multiple active SIM cards on the same device
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Automated History
                </h4>
                <p className="text-sm text-muted-foreground">
                  Automatic logging of all status changes with timestamps and reasons
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}