import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Search,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { simService } from "@/services/simService";
import { SimCard, SimStatus } from "@/lib/supabase";

// Status color mapping
const statusColors: Record<SimStatus, { bg: string; text: string; border: string; icon: string }> = {
  WAREHOUSE: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", icon: "text-gray-500" },
  ACTIVATED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300", icon: "text-blue-500" },
  INSTALLED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-300", icon: "text-green-500" },
  BILLING: { bg: "bg-green-50", text: "text-green-700", border: "border-green-300", icon: "text-green-500" },
  GRACE_PERIOD: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300", icon: "text-orange-500" },
  DEACTIVATED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", icon: "text-red-500" },
};

const statusLabels: Record<SimStatus, string> = {
  WAREHOUSE: "Warehouse",
  ACTIVATED: "Activated",
  INSTALLED: "Installed",
  BILLING: "Billing",
  GRACE_PERIOD: "Grace Period",
  DEACTIVATED: "Deactivated",
};

type ActionType = "activate" | "install" | "deactivate";

export default function Home() {
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<SimCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<SimStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  // Quick Action Dialog
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: ActionType | null;
    sim: SimCard | null;
  }>({ open: false, type: null, sim: null });
  const [actionData, setActionData] = useState({
    date: new Date().toISOString().split("T")[0],
    imei: "",
    reason: "",
  });

  useEffect(() => {
    loadSimCards();
  }, []);

  useEffect(() => {
    filterCards();
  }, [searchTerm, filterStatus, simCards]);

  const loadSimCards = async () => {
    try {
      setLoading(true);
      const cards = await simService.getSimCards();
      setSimCards(cards);
    } catch (error) {
      console.error("Error loading SIM cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCards = () => {
    let filtered = simCards;

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((card) => card.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.iccid.toLowerCase().includes(search) ||
          card.phone_number?.toLowerCase().includes(search) ||
          card.current_imei?.toLowerCase().includes(search) ||
          card.provider?.toLowerCase().includes(search)
      );
    }

    setFilteredCards(filtered);
  };

  const openActionDialog = (type: ActionType, sim: SimCard) => {
    setActionDialog({ open: true, type, sim });
    setActionData({
      date: new Date().toISOString().split("T")[0],
      imei: sim.current_imei || "",
      reason: "",
    });
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, type: null, sim: null });
    setActionData({ date: "", imei: "", reason: "" });
  };

  const handleQuickAction = async () => {
    if (!actionDialog.sim || !actionDialog.type) return;

    try {
      const simId = actionDialog.sim.id;

      switch (actionDialog.type) {
        case "activate":
          await simService.activateSimCard(simId, actionData.date);
          break;
        case "install":
          if (!actionData.imei) {
            alert("IMEI wajib diisi untuk instalasi!");
            return;
          }
          await simService.installSimCard(simId, actionData.date, actionData.imei);
          break;
        case "deactivate":
          await simService.deactivateSimCard(simId, actionData.date, actionData.reason);
          break;
      }

      closeActionDialog();
      loadSimCards();
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan");
    }
  };

  const canActivate = (sim: SimCard) => sim.status === "WAREHOUSE";
  const canInstall = (sim: SimCard) => sim.status === "ACTIVATED";
  const canDeactivate = (sim: SimCard) =>
    sim.status !== "DEACTIVATED" && sim.status !== "WAREHOUSE";

  const statusCounts = {
    ALL: simCards.length,
    WAREHOUSE: simCards.filter((s) => s.status === "WAREHOUSE").length,
    ACTIVATED: simCards.filter((s) => s.status === "ACTIVATED").length,
    INSTALLED: simCards.filter((s) => s.status === "INSTALLED").length,
    BILLING: simCards.filter((s) => s.status === "BILLING").length,
    GRACE_PERIOD: simCards.filter((s) => s.status === "GRACE_PERIOD").length,
    DEACTIVATED: simCards.filter((s) => s.status === "DEACTIVATED").length,
  };

  return (
    <Layout>
      <SEO title="Dashboard - BKT-SimCare" description="SIM Card Management Dashboard" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Manajemen kartu SIM dengan Quick Actions</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari ICCID, nomor telepon, IMEI, atau provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("ALL")}
          >
            Semua ({statusCounts.ALL})
          </Button>
          {(Object.keys(statusColors) as SimStatus[]).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={filterStatus === status ? statusColors[status].bg : ""}
            >
              {statusLabels[status]} ({statusCounts[status]})
            </Button>
          ))}
        </div>

        {/* SIM Cards Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat data...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== "ALL"
                  ? "Tidak ada kartu SIM yang sesuai dengan filter"
                  : "Belum ada kartu SIM"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map((sim) => {
              const colors = statusColors[sim.status];
              return (
                <Card
                  key={sim.id}
                  className={`${colors.border} border-2 hover:shadow-lg transition-shadow`}
                >
                  <CardHeader className={`${colors.bg} border-b`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className={`h-5 w-5 ${colors.icon}`} />
                        <CardTitle className="text-lg">{sim.iccid}</CardTitle>
                      </div>
                      <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>
                        {statusLabels[sim.status]}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3">
                    {/* Phone Number */}
                    <div className="flex items-center gap-2 text-sm">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {sim.phone_number || "No phone number"}
                      </span>
                    </div>

                    {/* IMEI */}
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        IMEI: {sim.current_imei || "Not assigned"}
                      </span>
                    </div>

                    {/* Provider */}
                    {sim.provider && (
                      <div className="text-sm text-muted-foreground">
                        Provider: {sim.provider}
                      </div>
                    )}

                    {/* Plan */}
                    {sim.plan_name && (
                      <div className="text-sm text-muted-foreground">
                        Plan: {sim.plan_name}
                      </div>
                    )}

                    {/* Monthly Cost */}
                    {sim.monthly_cost && (
                      <div className="text-sm font-medium text-primary">
                        Rp {sim.monthly_cost.toLocaleString("id-ID")}/bulan
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="pt-3 border-t flex flex-wrap gap-2">
                      {canActivate(sim) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => openActionDialog("activate", sim)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Aktivasi
                        </Button>
                      )}
                      {canInstall(sim) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => openActionDialog("install", sim)}
                        >
                          <Smartphone className="h-3 w-3 mr-1" />
                          Instalasi
                        </Button>
                      )}
                      {canDeactivate(sim) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => openActionDialog("deactivate", sim)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Non-aktifkan
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={closeActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === "activate" && "Aktivasi Kartu SIM"}
                {actionDialog.type === "install" && "Instalasi Kartu SIM"}
                {actionDialog.type === "deactivate" && "Non-aktifkan Kartu SIM"}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.sim && (
                  <span>
                    ICCID: <strong>{actionDialog.sim.iccid}</strong>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="action-date">Tanggal</Label>
                <Input
                  id="action-date"
                  type="date"
                  value={actionData.date}
                  onChange={(e) => setActionData({ ...actionData, date: e.target.value })}
                />
              </div>

              {actionDialog.type === "install" && (
                <div className="space-y-2">
                  <Label htmlFor="action-imei">IMEI Device *</Label>
                  <Input
                    id="action-imei"
                    placeholder="Masukkan IMEI device"
                    value={actionData.imei}
                    onChange={(e) => setActionData({ ...actionData, imei: e.target.value })}
                  />
                </div>
              )}

              {actionDialog.type === "deactivate" && (
                <div className="space-y-2">
                  <Label htmlFor="action-reason">Alasan (Opsional)</Label>
                  <Textarea
                    id="action-reason"
                    placeholder="Alasan deaktivasi..."
                    value={actionData.reason}
                    onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeActionDialog}>
                Batal
              </Button>
              <Button onClick={handleQuickAction}>
                {actionDialog.type === "activate" && "Aktivasi"}
                {actionDialog.type === "install" && "Instalasi"}
                {actionDialog.type === "deactivate" && "Non-aktifkan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}