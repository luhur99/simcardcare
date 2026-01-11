import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { simService, calculateDailyBurden, calculateGracePeriodCost, getGracePeriodStatus } from "@/services/simService";
import { SimCard, DailyBurdenLog } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CreditCard, Smartphone, Calendar, User, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Activity, Package, CheckCircle, RotateCcw, Info, DollarSign, TrendingUp, Gift, AlertTriangle } from "lucide-react";
import Link from "next/link";

// ⭐ Helper function to determine billing cycle source
function getBillingCycleSource(simCard: SimCard): string {
  if (!simCard.billing_cycle_day) return "";
  
  if (simCard.billing_cycle_source === "provider") {
    return "(From Provider)";
  } else if (simCard.billing_cycle_source === "installation") {
    return "(Installation Date)";
  } else if (simCard.billing_cycle_source === "custom") {
    return "(Custom)";
  }
  
  // Fallback: try to infer from installation date
  if (simCard.installation_date) {
    const installDay = new Date(simCard.installation_date).getDate();
    if (installDay === simCard.billing_cycle_day) {
      return "(Installation Date)";
    }
  }
  
  return "(Custom/Provider)";
}

// ⭐ Helper function to calculate free pulsa cost
function calculateFreePulsaCost(simCard: SimCard) {
  if (!simCard.free_pulsa_months || !simCard.installation_date || !simCard.monthly_cost) {
    return {
      monthsElapsed: 0,
      costIncurred: 0,
      isActive: false,
      expiryDate: null,
      daysRemaining: 0,
      progressPercent: 0
    };
  }

  const installDate = new Date(simCard.installation_date);
  const today = new Date();
  
  // Calculate months elapsed (inclusive of current month if started)
  const yearDiff = today.getFullYear() - installDate.getFullYear();
  const monthDiff = today.getMonth() - installDate.getMonth();
  const monthsElapsed = yearDiff * 12 + monthDiff + 1; // +1 because first month counts
  
  // Calculate expiry date (end of the last free month)
  const expiryDate = new Date(installDate);
  expiryDate.setMonth(expiryDate.getMonth() + simCard.free_pulsa_months);
  expiryDate.setDate(0); // Last day of previous month (end of free period)
  
  // Check if still active
  const isActive = today <= expiryDate;
  
  // Calculate cost incurred (only up to free_pulsa_months)
  const monthsToCharge = Math.min(monthsElapsed, simCard.free_pulsa_months);
  const costIncurred = simCard.monthly_cost * monthsToCharge;
  
  // Calculate days remaining
  const daysRemaining = isActive 
    ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  // Calculate progress percentage
  const progressPercent = Math.min((monthsElapsed / simCard.free_pulsa_months) * 100, 100);
  
  return {
    monthsElapsed: monthsToCharge,
    totalFreeMonths: simCard.free_pulsa_months,
    costIncurred,
    isActive,
    expiryDate,
    daysRemaining,
    progressPercent
  };
}

export default function SimCardDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [simCard, setSimCard] = useState<SimCard | null>(null);
  const [burdenLogs, setBurdenLogs] = useState<DailyBurdenLog[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === "string") {
      loadSimCardData(id);
    }
  }, [id]);

  const loadSimCardData = async (simId: string) => {
    try {
      setLoading(true);
      const [sim, logs] = await Promise.all([
        simService.getSimCardById(simId),
        simService.getDailyBurdenLogs(simId)
      ]);
      setSimCard(sim);
      setBurdenLogs(logs);
      
      // Load status history (mock for now, will use Supabase when connected)
      const mockHistory = [
        {
          id: "1",
          timestamp: sim.created_at,
          event_type: "CREATED",
          old_status: null,
          new_status: "WAREHOUSE",
          changed_by: "System",
          reason: "SIM card created in system",
          metadata: {}
        },
        ...(sim.activation_date ? [{
          id: "2",
          timestamp: sim.activation_date,
          event_type: "STATUS_CHANGE",
          old_status: "WAREHOUSE",
          new_status: "ACTIVATED",
          changed_by: "Admin",
          reason: "SIM card activated",
          metadata: {}
        }] : []),
        ...(sim.installation_date ? [{
          id: "3",
          timestamp: sim.installation_date,
          event_type: "INSTALLED",
          old_status: "ACTIVATED",
          new_status: "INSTALLED",
          changed_by: "Technician",
          reason: `Installed on device IMEI: ${sim.current_imei || 'N/A'}`,
          metadata: { imei: sim.current_imei }
        }] : []),
        ...(sim.status === "BILLING" ? [{
          id: "4",
          timestamp: new Date().toISOString(),
          event_type: "STATUS_CHANGE",
          old_status: "INSTALLED",
          new_status: "BILLING",
          changed_by: "System",
          reason: "Billing cycle started",
          metadata: {}
        }] : []),
        ...(sim.status === "GRACE_PERIOD" ? [{
          id: "5",
          timestamp: new Date().toISOString(),
          event_type: "STATUS_CHANGE",
          old_status: "INSTALLED",
          new_status: "GRACE_PERIOD",
          changed_by: "System",
          reason: "Entered grace period",
          metadata: {}
        }] : []),
        ...(sim.deactivation_date ? [{
          id: "6",
          timestamp: sim.deactivation_date,
          event_type: "STATUS_CHANGE",
          old_status: sim.status === "DEACTIVATED" ? "BILLING" : sim.status,
          new_status: "DEACTIVATED",
          changed_by: "Admin",
          reason: sim.deactivation_reason || "SIM card deactivated",
          metadata: {}
        }] : [])
      ];
      
      setStatusHistory(mockHistory.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error("Error loading SIM card:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getEventIcon = (eventType: string, newStatus: string) => {
    switch (eventType) {
      case "CREATED":
        return <Package className="h-5 w-5 text-gray-500" />;
      case "STATUS_CHANGE":
        switch (newStatus) {
          case "ACTIVATED":
            return <CheckCircle className="h-5 w-5 text-green-500" />;
          case "INSTALLED":
            return <Smartphone className="h-5 w-5 text-blue-500" />;
          case "BILLING":
            return <CreditCard className="h-5 w-5 text-purple-500" />;
          case "GRACE_PERIOD":
            return <Clock className="h-5 w-5 text-yellow-500" />;
          case "DEACTIVATED":
            return <XCircle className="h-5 w-5 text-red-500" />;
          default:
            return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
      case "INSTALLED":
        return <Smartphone className="h-5 w-5 text-blue-500" />;
      case "DEVICE_CHANGE":
        return <RotateCcw className="h-5 w-5 text-orange-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEventTitle = (eventType: string, newStatus: string, oldStatus: string | null) => {
    switch (eventType) {
      case "CREATED":
        return "SIM Card Created";
      case "STATUS_CHANGE":
        return `Status berubah: ${oldStatus || '-'} → ${newStatus}`;
      case "INSTALLED":
        return "Installed on Device";
      case "DEVICE_CHANGE":
        return "Device Changed";
      default:
        return "Activity";
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      WAREHOUSE: "bg-gray-500",
      ACTIVATED: "bg-blue-500",
      INSTALLED: "bg-green-500",
      BILLING: "bg-yellow-500",
      GRACE_PERIOD: "bg-orange-500",
      DEACTIVATED: "bg-red-500"
    };
    return colors[status] || "bg-gray-500";
  };

  // Memoized calculations
  const burden = useMemo(() => simCard ? calculateDailyBurden(simCard) : { overlap_1_days: 0, overlap_1_cost: 0, overlap_2_days: 0, overlap_2_cost: 0 }, [simCard]);
  
  const dailyRate = useMemo(() => simCard ? (simCard.monthly_cost || 0) / 30 : 0, [simCard]);
  
  const freePulsaCalc = useMemo(() => simCard ? calculateFreePulsaCost(simCard) : {
    monthsElapsed: 0,
    totalFreeMonths: 0,
    costIncurred: 0,
    isActive: false,
    expiryDate: null,
    daysRemaining: 0,
    progressPercent: 0
  }, [simCard]);
  
  const graceStatus = useMemo(() => simCard ? getGracePeriodStatus(simCard) : {
    isInGracePeriod: false,
    daysInGracePeriod: 0,
    exceedsMaxDuration: false,
    daysOverdue: 0
  }, [simCard]);
  
  const gracePeriodCost = useMemo(() => simCard ? calculateGracePeriodCost(simCard) : {
    gracePeriodDays: 0,
    gracePeriodCost: 0
  }, [simCard]);

  if (loading) {
    return (
      <Layout>
        <SEO title="Loading SIM Card Detail" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading SIM card details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!simCard) {
    return (
      <Layout>
        <SEO title="SIM Card Not Found" />
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">SIM Card Not Found</h1>
          <Link href="/sim-cards">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to SIM Cards
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title={`Detail SIM ${simCard.phone_number}`} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/sim-cards">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Detail SIM Card</h1>
              <p className="text-muted-foreground">
                {simCard.phone_number}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(simCard.status)}>
            {simCard.status}
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="info">Informasi Umum</TabsTrigger>
            <TabsTrigger value="timeline">Timeline Aktivitas</TabsTrigger>
          </TabsList>

          {/* Tab Content: Informasi Umum */}
          <TabsContent value="info" className="space-y-6 mt-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informasi SIM Card
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nomor Telepon</p>
                    <p className="font-medium">{simCard.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ICCID</p>
                    <p className="font-medium">{simCard.iccid}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Provider</p>
                    <p className="font-medium">{simCard.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paket</p>
                    <p className="font-medium">{simCard.plan_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">IMEI Terpasang</p>
                    <p className="font-medium">{simCard.current_imei || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <Gift className="inline h-4 w-4 mr-1" />
                      Pulsa Gratis
                    </p>
                    <div className="font-medium">
                      {simCard.free_pulsa_months ? (
                        <Badge variant="secondary" className="font-normal">
                          {simCard.free_pulsa_months} bulan
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                  {simCard.status === "GRACE_PERIOD" && simCard.grace_period_start_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Total Hari di Grace Period
                      </p>
                      <div className="font-medium">
                        <Badge variant="destructive" className="font-normal">
                          {graceStatus.daysInGracePeriod} hari
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start: {formatDate(simCard.grace_period_start_date)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Date Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline Aktivitas
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Aktivasi</p>
                  <p className="font-medium">{formatDate(simCard.activation_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Instalasi</p>
                  <p className="font-medium">{formatDate(simCard.installation_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Deaktivasi</p>
                  <p className="font-medium">{formatDate(simCard.deactivation_date)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Free Pulsa Cost Tracking */}
            {simCard.free_pulsa_months && simCard.installation_date && (
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-green-600" />
                    Biaya Pulsa Gratis yang Sudah Dikeluarkan
                  </CardTitle>
                  <CardDescription>
                    Tracking biaya operasional untuk periode pulsa gratis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Cost Incurred */}
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        Total Biaya yang Sudah Dikeluarkan
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(freePulsaCalc.costIncurred)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {freePulsaCalc.monthsElapsed} dari {freePulsaCalc.totalFreeMonths} bulan
                      </p>
                    </div>

                    {/* Monthly Cost */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Biaya per Bulan</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(simCard.monthly_cost)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Fixed rate
                      </p>
                    </div>

                    {/* Status */}
                    <div className={`p-4 rounded-lg ${
                      freePulsaCalc.isActive 
                        ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800'
                    }`}>
                      <p className="text-sm text-muted-foreground mb-2">Status</p>
                      <div className="flex items-center gap-2">
                        {freePulsaCalc.isActive ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-bold text-green-600">Aktif</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-gray-600" />
                            <span className="font-bold text-gray-600">Berakhir</span>
                          </>
                        )}
                      </div>
                      {freePulsaCalc.isActive && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {freePulsaCalc.daysRemaining} hari lagi
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress Periode Gratis</span>
                      <span className="font-medium">
                        {freePulsaCalc.monthsElapsed} / {freePulsaCalc.totalFreeMonths} bulan
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          freePulsaCalc.isActive ? 'bg-green-600' : 'bg-gray-400'
                        }`}
                        style={{ width: `${freePulsaCalc.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {freePulsaCalc.progressPercent.toFixed(0)}% terpakai
                    </p>
                  </div>

                  <Separator />

                  {/* Detailed Breakdown */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Detail Perhitungan:</p>
                    
                    <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tanggal Instalasi:</span>
                        <span className="font-medium">{formatDate(simCard.installation_date)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Durasi Gratis:</span>
                        <span className="font-medium">{simCard.free_pulsa_months} bulan</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tanggal Berakhir:</span>
                        <span className="font-medium">
                          {formatDate(freePulsaCalc.expiryDate?.toISOString() || null)}
                        </span>
                      </div>

                      <Separator className="my-2" />
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bulan yang Sudah Berjalan:</span>
                        <span className="font-medium">{freePulsaCalc.monthsElapsed} bulan</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Biaya per Bulan:</span>
                        <span className="font-medium">{formatCurrency(simCard.monthly_cost)}</span>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="flex justify-between items-center pt-2 border-t-2 border-green-200 dark:border-green-800">
                        <span className="font-semibold">Total Biaya Dikeluarkan:</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(freePulsaCalc.costIncurred)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        = {formatCurrency(simCard.monthly_cost)} × {freePulsaCalc.monthsElapsed} bulan
                      </p>
                    </div>

                    {/* Warning if expired */}
                    {!freePulsaCalc.isActive && (
                      <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Periode pulsa gratis telah berakhir. SIM card sekarang dikenakan biaya normal.
                        </p>
                      </div>
                    )}

                    {/* Info if still active */}
                    {freePulsaCalc.isActive && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 rounded">
                        <p className="text-xs text-blue-800 dark:text-blue-200 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Periode gratis masih aktif. Biaya ini adalah operasional internal, tidak ditagihkan ke customer.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Cycle Information */}
            {simCard.billing_cycle_day && (
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Informasi Billing Cycle
                  </CardTitle>
                  <CardDescription>
                    Siklus pembayaran dan periode billing SIM card
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Tanggal Billing Bulanan</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-blue-600">
                          {simCard.billing_cycle_day}
                        </p>
                        <p className="text-sm text-muted-foreground">setiap bulan</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {getBillingCycleSource(simCard)}
                      </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Billing Berikutnya</p>
                      <div className="space-y-1">
                        <p className="text-lg font-bold">
                          {(() => {
                            const today = new Date();
                            const currentMonth = today.getMonth();
                            const currentYear = today.getFullYear();
                            const billingDay = simCard.billing_cycle_day;
                            let nextBillingDate = new Date(currentYear, currentMonth, billingDay);
                            if (nextBillingDate <= today) {
                              nextBillingDate = new Date(currentYear, currentMonth + 1, billingDay);
                            }
                            return formatDate(nextBillingDate.toISOString());
                          })()}
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {(() => {
                              const today = new Date();
                              const currentMonth = today.getMonth();
                              const currentYear = today.getFullYear();
                              const billingDay = simCard.billing_cycle_day;
                              let nextBillingDate = new Date(currentYear, currentMonth, billingDay);
                              if (nextBillingDate <= today) {
                                nextBillingDate = new Date(currentYear, currentMonth + 1, billingDay);
                              }
                              const daysUntil = Math.ceil((nextBillingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              return `${daysUntil} hari lagi`;
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-semibold mb-3">Periode Billing Saat Ini</p>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Mulai</p>
                          <p className="font-medium">
                            {(() => {
                              const today = new Date();
                              const currentMonth = today.getMonth();
                              const currentYear = today.getFullYear();
                              const billingDay = simCard.billing_cycle_day;
                              let periodStart = new Date(currentYear, currentMonth, billingDay);
                              if (today.getDate() < billingDay) {
                                periodStart = new Date(currentYear, currentMonth - 1, billingDay);
                              }
                              return formatDate(periodStart.toISOString());
                            })()}
                          </p>
                        </div>

                        <div className="text-center px-4">
                          <div className="text-2xl text-muted-foreground">→</div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Berakhir</p>
                          <p className="font-medium">
                            {(() => {
                              const today = new Date();
                              const currentMonth = today.getMonth();
                              const currentYear = today.getFullYear();
                              const billingDay = simCard.billing_cycle_day;
                              let periodEnd = new Date(currentYear, currentMonth + 1, billingDay - 1);
                              if (today.getDate() < billingDay) {
                                periodEnd = new Date(currentYear, currentMonth, billingDay - 1);
                              }
                              return formatDate(periodEnd.toISOString());
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Daily Burden Calculation */}
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Perhitungan Daily Burden
                </CardTitle>
                <CardDescription>
                  Biaya harian dihitung secara otomatis berdasarkan: Monthly Cost / 30 = {formatCurrency(dailyRate)}/hari
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Monthly Cost */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Biaya Bulanan</p>
                      <p className="text-2xl font-bold">{formatCurrency(simCard.monthly_cost)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>

                <Separator />

                {/* Overlap 1: Activation to Installation */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <h4 className="font-semibold">Overlap 1: Aktivasi → Instalasi</h4>
                  </div>
                  <div className="pl-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Periode:</span>
                      <span className="font-medium">
                        {formatDate(simCard.activation_date)} s/d {formatDate(simCard.installation_date)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jumlah Hari:</span>
                      <span className="font-medium">{burden.overlap_1_days} hari</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tarif Harian:</span>
                      <span className="font-medium">{formatCurrency(dailyRate)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Total Overlap 1:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(burden.overlap_1_cost)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Overlap 2: Due Date to Deactivation */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <h4 className="font-semibold">Overlap 2: Jatuh Tempo → Deaktivasi</h4>
                  </div>
                  {simCard.deactivation_date && simCard.billing_cycle_day ? (
                    <div className="pl-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Periode:</span>
                        <span className="font-medium">
                          Billing Day {simCard.billing_cycle_day} s/d {formatDate(simCard.deactivation_date)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jumlah Hari:</span>
                        <span className="font-medium">{burden.overlap_2_days} hari</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tarif Harian:</span>
                        <span className="font-medium">{formatCurrency(dailyRate)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold">Total Overlap 2:</span>
                        <span className="font-bold text-orange-600">{formatCurrency(burden.overlap_2_cost)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="pl-4 text-sm text-muted-foreground">
                      <Info className="inline h-4 w-4 mr-1" />
                      Overlap 2 akan dihitung setelah SIM card di-deaktivasi
                    </p>
                  )}
                </div>

                {/* Grace Period Cost */}
                {simCard.status === 'GRACE_PERIOD' && simCard.grace_period_start_date && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <h4 className="font-semibold">Biaya Grace Period (Overdue)</h4>
                      </div>
                      <div className="pl-4 space-y-2 text-sm">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800 mb-2">
                          <p className="text-xs text-blue-800 dark:text-blue-200 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Grace Period Start = Billing Cycle Day (tanggal jatuh tempo pembayaran)
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Billing Cycle Day:</span>
                          <span className="font-medium">Day {simCard.billing_cycle_day} setiap bulan</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Grace Period Start:</span>
                          <span className="font-medium">{formatDate(simCard.grace_period_start_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tanggal Sekarang:</span>
                          <span className="font-medium">{formatDate(new Date().toISOString())}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Jumlah Hari Overdue:</span>
                          <span className="font-medium text-orange-600 font-bold">
                            {gracePeriodCost.gracePeriodDays} hari
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tarif Harian:</span>
                          <span className="font-medium">{formatCurrency(dailyRate)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-semibold">Total Biaya Grace Period:</span>
                          <span className="font-bold text-yellow-600">
                            {formatCurrency(gracePeriodCost.gracePeriodCost)}
                          </span>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-2 rounded mt-2">
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            <AlertCircle className="inline h-3 w-3 mr-1" />
                            Biaya ini akan ditambahkan ke akumulasi total saat SIM di-non-aktifkan. Max 30 hari, setelah itu admin harus manual deactivate.
                          </p>
                        </div>
                        {graceStatus.exceedsMaxDuration && (
                          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-2 rounded mt-2">
                            <p className="text-xs text-red-800 dark:text-red-200 font-semibold flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              PERINGATAN: Sudah melewati batas maksimal 30 hari! Segera lakukan deactivation! (Overdue: {graceStatus.daysInGracePeriod - 30} hari)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Total Accumulated Cost */}
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Akumulasi Biaya</p>
                      <p className="text-3xl font-bold text-primary">{formatCurrency(simCard.accumulated_cost)}</p>
                    </div>
                    <DollarSign className="h-12 w-12 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Burden Calculation Logs */}
            {burdenLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Riwayat Perhitungan
                  </CardTitle>
                  <CardDescription>
                    Log audit untuk perhitungan daily burden
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {burdenLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className={`h-2 w-2 rounded-full mt-2 ${
                          log.calculation_type === 'OVERLAP_1' ? 'bg-blue-500' : 'bg-orange-500'
                        }`} />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{log.description}</p>
                            <Badge variant="outline">{log.calculation_type}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>Periode: {formatDate(log.start_date)} - {formatDate(log.end_date)}</p>
                            <p>Durasi: {log.days_count} hari × {formatCurrency(log.daily_rate)}/hari</p>
                          </div>
                          <p className="text-lg font-bold text-primary">{formatCurrency(log.total_cost)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {simCard.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Catatan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{simCard.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Content: Timeline Aktivitas */}
          <TabsContent value="timeline" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline Aktivitas
                </CardTitle>
                <CardDescription>
                  Riwayat lengkap perubahan status dan aktivitas SIM card
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statusHistory.length > 0 ? (
                  <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {statusHistory.map((event, index) => (
                      <div key={event.id} className="relative flex items-start gap-4">
                        {/* Icon */}
                        <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-slate-300 shadow-sm">
                          {getEventIcon(event.event_type, event.new_status)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 rounded-lg border bg-card p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-base">
                                {getEventTitle(event.event_type, event.new_status, event.old_status)}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatDateTime(event.timestamp)}
                              </p>
                            </div>
                            {event.new_status && (
                              <Badge className={getStatusColor(event.new_status)}>
                                {event.new_status}
                              </Badge>
                            )}
                          </div>
                          
                          {event.reason && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.reason}
                            </p>
                          )}
                          
                          {event.metadata?.imei && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">IMEI:</span>{" "}
                              <span className="font-mono">{event.metadata.imei}</span>
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <span>👤</span>
                            <span>Oleh: {event.changed_by}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Belum ada riwayat aktivitas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}