import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { simService, calculateDailyBurden, calculateGracePeriodCost } from "@/services/simService";
import { SimCard, DailyBurdenLog } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, CreditCard, DollarSign, TrendingUp, Info, Clock, Package, CheckCircle, Smartphone, AlertCircle, XCircle, RotateCcw } from "lucide-react";
import Link from "next/link";

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

  const burden = calculateDailyBurden(simCard);
  const dailyRate = (simCard.monthly_cost || 0) / 30;

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
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nomor Telepon</p>
                  <p className="font-medium">{simCard.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ICCID</p>
                  <p className="font-medium">{simCard.iccid || "-"}</p>
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
                  <p className="text-sm text-muted-foreground">Billing Cycle Day</p>
                  <p className="font-medium">{simCard.billing_cycle_day || "-"}</p>
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
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Periode:</span>
                          <span className="font-medium">
                            {formatDate(simCard.grace_period_start_date)} s/d Sekarang
                          </span>
                        </div>
                        {simCard.grace_period_due_date && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Batas Bayar:</span>
                            <span className="font-medium">{formatDate(simCard.grace_period_due_date)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Jumlah Hari Overdue:</span>
                          <span className="font-medium">{(() => {
                            const graceCost = calculateGracePeriodCost(simCard);
                            return graceCost.gracePeriodDays;
                          })()} hari</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tarif Harian:</span>
                          <span className="font-medium">{formatCurrency(dailyRate)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-semibold">Total Biaya Grace Period:</span>
                          <span className="font-bold text-yellow-600">{formatCurrency((() => {
                            const graceCost = calculateGracePeriodCost(simCard);
                            return graceCost.gracePeriodCost;
                          })())}</span>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 p-2 rounded mt-2">
                          <p className="text-xs text-yellow-800">
                            <AlertCircle className="inline h-3 w-3 mr-1" />
                            Biaya ini akan ditambahkan ke akumulasi total saat SIM di-non-aktifkan
                          </p>
                        </div>
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