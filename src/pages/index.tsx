import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Search,
  AlertCircle,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { simService } from "@/services/simService";
import { SimCard, SimStatus } from "@/lib/supabase";

// Status color mapping
const statusColors: Record<SimStatus, { bg: string; text: string; border: string }> = {
  WAREHOUSE: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  ACTIVATED: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  INSTALLED: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
  BILLING: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
  GRACE_PERIOD: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  DEACTIVATED: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
};

const statusLabels: Record<SimStatus, string> = {
  WAREHOUSE: "Warehouse",
  ACTIVATED: "Activated",
  INSTALLED: "Installed",
  BILLING: "Billing",
  GRACE_PERIOD: "Grace Period",
  DEACTIVATED: "Deactivated",
};

type ActionType = "activate" | "install" | "deactivate" | "reactivate";

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
          card.phone_number.toLowerCase().includes(search) ||
          card.iccid?.toLowerCase().includes(search) ||
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
        case "reactivate":
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
  const canReactivate = (sim: SimCard) => sim.status === "DEACTIVATED";
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
              placeholder="Cari nomor SIM, ICCID, IMEI, atau provider..."
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
            >
              {statusLabels[status]} ({statusCounts[status]})
            </Button>
          ))}
        </div>

        {/* SIM Cards Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Kartu SIM</CardTitle>
            <CardDescription>
              {filteredCards.length} kartu dari total {simCards.length} kartu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Memuat data...</p>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== "ALL"
                    ? "Tidak ada kartu SIM yang sesuai dengan filter"
                    : "Belum ada kartu SIM"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>No SIM Card</TableHead>
                      <TableHead>IMEI</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Paket</TableHead>
                      <TableHead className="text-right">Biaya/Bulan</TableHead>
                      <TableHead className="text-right">Quick Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCards.map((sim) => {
                      const colors = statusColors[sim.status];
                      return (
                        <TableRow key={sim.id}>
                          <TableCell>
                            <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>
                              {statusLabels[sim.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                              <span>{sim.phone_number}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{sim.current_imei || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{sim.provider || "-"}</TableCell>
                          <TableCell>{sim.plan_name || "-"}</TableCell>
                          <TableCell className="text-right font-medium">
                            {sim.monthly_cost ? `Rp ${sim.monthly_cost.toLocaleString("id-ID")}` : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              {canActivate(sim) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openActionDialog("activate", sim)}
                                  className="h-8"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Aktivasi
                                </Button>
                              )}
                              {canReactivate(sim) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openActionDialog("reactivate", sim)}
                                  className="h-8"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Reaktivasi
                                </Button>
                              )}
                              {canInstall(sim) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openActionDialog("install", sim)}
                                  className="h-8"
                                >
                                  <Smartphone className="h-3 w-3 mr-1" />
                                  Instalasi
                                </Button>
                              )}
                              {canDeactivate(sim) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openActionDialog("deactivate", sim)}
                                  className="h-8"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Non-aktifkan
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={closeActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === "activate" && "Aktivasi Kartu SIM"}
                {actionDialog.type === "reactivate" && "Reaktivasi Kartu SIM"}
                {actionDialog.type === "install" && "Instalasi Kartu SIM"}
                {actionDialog.type === "deactivate" && "Non-aktifkan Kartu SIM"}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.sim && (
                  <span>
                    No SIM: <strong>{actionDialog.sim.phone_number}</strong>
                    {actionDialog.sim.iccid && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (ICCID: {actionDialog.sim.iccid})
                      </span>
                    )}
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
                {actionDialog.type === "reactivate" && "Reaktivasi"}
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