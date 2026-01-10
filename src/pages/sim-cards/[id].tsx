import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { simService, calculateDailyBurden } from "@/services/simService";
import { SimCard, DailyBurdenLog } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, CreditCard, DollarSign, TrendingUp, Info, Clock } from "lucide-react";
import Link from "next/link";

export default function SimCardDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [simCard, setSimCard] = useState<SimCard | null>(null);
  const [burdenLogs, setBurdenLogs] = useState<DailyBurdenLog[]>([]);
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
      <SEO title={`Detail SIM ${simCard.phone_number || simCard.iccid}`} />
      
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
                {simCard.phone_number || simCard.iccid}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(simCard.status)}>
            {simCard.status}
          </Badge>
        </div>

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
              <p className="text-sm text-muted-foreground">ICCID</p>
              <p className="font-medium">{simCard.iccid}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nomor Telepon</p>
              <p className="font-medium">{simCard.phone_number || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="font-medium">{simCard.provider}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paket</p>
              <p className="font-medium">{simCard.plan_type || "-"}</p>
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
      </div>
    </Layout>
  );
}