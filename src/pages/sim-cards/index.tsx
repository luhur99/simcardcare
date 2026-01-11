import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Download, Eye, Upload, AlertCircle, CheckCircle2, XCircle, PlayCircle, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { simService } from "@/services/simService";
import { SimCard, SimStatus } from "@/lib/supabase";
import Link from "next/link";
import { ExcelImport } from "@/components/ExcelImport";
import { calculateGracePeriodCost } from "@/services/simService";
import { useRouter } from "next/router";

// Helper function
const getTodayDate = () => new Date().toISOString().split("T")[0];

const STATUS_COLORS: Record<SimStatus, string> = {
  WAREHOUSE: "bg-gray-500",
  ACTIVATED: "bg-blue-500",
  INSTALLED: "bg-green-500",
  BILLING: "bg-purple-500",
  GRACE_PERIOD: "bg-yellow-500",
  DEACTIVATED: "bg-red-500"
};

const STATUS_ICONS: Record<SimStatus, React.ReactNode> = {
  WAREHOUSE: <Package className="h-4 w-4" />,
  ACTIVATED: <PlayCircle className="h-4 w-4" />,
  INSTALLED: <CheckCircle2 className="h-4 w-4" />,
  BILLING: <AlertCircle className="h-4 w-4" />,
  GRACE_PERIOD: <AlertCircle className="h-4 w-4" />,
  DEACTIVATED: <XCircle className="h-4 w-4" />
};

type ActionType = "activate" | "install" | "grace_period" | "reactivate" | "deactivate" | null;

export default function SimCardsPage() {
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [filteredSims, setFilteredSims] = useState<SimCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SimStatus | "ALL">("ALL");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Action Dialog State
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    type: ActionType;
    sim: SimCard | null;
  }>({
    isOpen: false,
    type: null,
    sim: null
  });

  const [actionFormData, setActionFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    reason: "",
    imei: ""
  });

  // Installation Form State
  const [installationDate, setInstallationDate] = useState(getTodayDate());
  const [imei, setImei] = useState("");
  const [freePulsaMonths, setFreePulsaMonths] = useState<number>(0);
  const [billingCycleOption, setBillingCycleOption] = useState<"existing" | "installation" | "custom">("existing");
  const [customBillingDay, setCustomBillingDay] = useState<number>(1);

  // Form State for Add SIM
  const [formData, setFormData] = useState({
    phone_number: "",
    iccid: "",
    provider: "",
    plan_name: "",
    status: "WAREHOUSE" as SimStatus,
    current_imei: "",
    monthly_cost: "",
    notes: "",
    activation_date: "",
    installation_date: "",
    deactivation_date: "",
    deactivation_reason: ""
  });

  const [selectedSim, setSelectedSim] = useState<SimCard | null>(null);
  const [activationDate, setActivationDate] = useState(getTodayDate());

  useEffect(() => {
    loadSimCards();
  }, []);

  useEffect(() => {
    filterSimCards();
  }, [simCards, searchQuery, statusFilter]);

  const loadSimCards = async () => {
    setIsLoading(true);
    try {
      const data = await simService.getSimCards();
      setSimCards(data);
    } catch (error) {
      console.error("Error loading SIM cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSimCards = () => {
    let filtered = simCards;

    if (searchQuery) {
      filtered = filtered.filter(sim =>
        sim.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.iccid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(sim => sim.status === statusFilter);
    }

    setFilteredSims(filtered);
  };

  const handleAddSimCard = async () => {
    try {
      if (!formData.phone_number || !formData.provider) {
        alert("Nomor SIM Card dan Provider wajib diisi!");
        return;
      }

      if (formData.status === "DEACTIVATED" && !formData.deactivation_reason) {
        alert("Alasan Deaktivasi wajib diisi untuk status DEACTIVATED!");
        return;
      }

      const newSim = {
        phone_number: formData.phone_number,
        iccid: formData.iccid || null,
        provider: formData.provider,
        plan_name: formData.plan_name || null,
        status: formData.status,
        current_imei: formData.current_imei || null,
        activation_date: formData.activation_date || null,
        installation_date: formData.installation_date || null,
        deactivation_date: formData.deactivation_date || null,
        deactivation_reason: formData.deactivation_reason || null,
        billing_cycle_day: null,
        monthly_cost: Number(formData.monthly_cost) || 0,
        accumulated_cost: 0,
        notes: formData.notes || null,
        is_reactivated: false,
        replacement_reason: null,
        free_pulsa_months: null,
        grace_period_start_date: null,
        grace_period_due_date: null
      };

      await simService.createSimCard(newSim);
      await loadSimCards();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.message || "Error adding SIM card");
    }
  };

  const resetForm = () => {
    setFormData({
      phone_number: "",
      iccid: "",
      provider: "",
      plan_name: "",
      status: "WAREHOUSE",
      current_imei: "",
      monthly_cost: "",
      notes: "",
      activation_date: "",
      installation_date: "",
      deactivation_date: "",
      deactivation_reason: ""
    });
  };

  const openActionDialog = (type: ActionType, sim: SimCard) => {
    setActionDialog({
      isOpen: true,
      type,
      sim
    });
    // Reset specific form states
    setInstallationDate(getTodayDate());
    setImei(sim.current_imei || "");
    setFreePulsaMonths(0);
    setBillingCycleOption("existing");
    setCustomBillingDay(1);
    
    setActionFormData({
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      reason: "",
      imei: sim.current_imei || ""
    });
  };

  const closeActionDialog = () => {
    setActionDialog({
      isOpen: false,
      type: null,
      sim: null
    });
    setActionFormData({
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      reason: "",
      imei: ""
    });
  };

  const handleActionSubmit = async () => {
    if (!actionDialog.sim) return;

    try {
      const simId = actionDialog.sim.id;

      switch (actionDialog.type) {
        case "activate":
          await simService.activateSimCard(simId, actionFormData.date);
          break;

        case "install":
          if (!imei.trim()) {
            alert("IMEI device wajib diisi untuk instalasi!");
            return;
          }

          // Determine billing cycle day based on selected option
          let billingCycleDay: number | undefined = undefined;
          let useInstallationAsBilling = false;
          
          if (billingCycleOption === "installation") {
            useInstallationAsBilling = true;
          } else if (billingCycleOption === "custom") {
            billingCycleDay = customBillingDay;
          }
          
          await simService.installSimCard(
            simId, 
            installationDate, 
            imei.trim(), 
            freePulsaMonths,
            useInstallationAsBilling,
            billingCycleDay
          );
          break;

        case "grace_period":
          if (!actionFormData.dueDate) {
            alert("Batas Bayar Langganan Pulsa wajib diisi!");
            return;
          }
          
          // VALIDATION: Grace period date must be after activation date
          if (actionDialog.sim.activation_date) {
            const activationDate = new Date(actionDialog.sim.activation_date);
            const gracePeriodDate = new Date(actionFormData.date);
            
            if (gracePeriodDate < activationDate) {
              alert("Tanggal Grace Period tidak boleh sebelum tanggal aktivasi!");
              return;
            }
          }
          
          await simService.enterGracePeriod(
            simId,
            actionFormData.date,
            actionFormData.dueDate
          );
          break;

        case "reactivate":
          await simService.activateSimCard(simId, actionFormData.date);
          break;

        case "deactivate":
          if (!actionFormData.reason) {
            alert("Alasan deaktivasi wajib diisi!");
            return;
          }
          await simService.deactivateSimCard(
            simId,
            actionFormData.date,
            actionFormData.reason
          );
          break;
      }

      await loadSimCards();
      closeActionDialog();
    } catch (error: any) {
      alert(error.message || "Error processing action");
    }
  };

  const calculateDaysOverdue = (startDate: string | null): number | null => {
    if (!startDate) return null;
    
    try {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) return null;
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch {
      return null;
    }
  };

  const getDaysColorClass = (days: number): string => {
    if (days <= 5) return "text-green-600";
    if (days <= 10) return "text-yellow-600";
    return "text-red-600";
  };

  const handleImportData = async (data: any[]) => {
    const errors: any[] = [];
    const duplicates: string[] = [];
    const successfulImports: any[] = [];
    
    const existingPhoneNumbers = new Set(simCards.map(sim => sim.phone_number));
    const importPhoneNumbers = new Set();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;

      try {
        let phoneNumber = String(row["No SIM Card"] || row["No Simcard"] || row["Phone Number"] || row["Nomor Telepon"] || "").trim();
        const iccid = String(row["ICCID"] || "").trim();
        const provider = String(row["Provider"] || row["Operator"] || "").trim();
        const packageName = String(row["Package"] || row["Paket"] || "").trim();
        const monthlyCost = String(row["Monthly Cost"] || row["Biaya Bulanan"] || "0").trim();
        const status = String(row["Status"] || "WAREHOUSE").toUpperCase().trim();

        if (!phoneNumber) {
          errors.push({
            row: rowNum,
            field: "No SIM Card",
            message: "Phone number is required",
            value: phoneNumber
          });
          continue;
        }

        if (!phoneNumber.startsWith("0")) {
          phoneNumber = "0" + phoneNumber;
        }

        if (existingPhoneNumbers.has(phoneNumber)) {
          duplicates.push(`${phoneNumber} (Row ${rowNum}) - Already exists in database`);
          continue;
        }

        if (importPhoneNumbers.has(phoneNumber)) {
          duplicates.push(`${phoneNumber} (Row ${rowNum}) - Duplicate in import file`);
          continue;
        }

        importPhoneNumbers.add(phoneNumber);

        const simData = {
          phone_number: phoneNumber,
          iccid: iccid || null,
          provider: provider || null,
          plan_name: packageName || null,
          status: ["WAREHOUSE", "ACTIVATED", "INSTALLED", "BILLING", "GRACE_PERIOD", "DEACTIVATED"].includes(status) 
            ? status 
            : "WAREHOUSE",
          current_imei: null,
          monthly_cost: monthlyCost ? parseFloat(monthlyCost.replace(/[^0-9.-]/g, "")) : 0,
          activation_date: null,
          installation_date: null,
          billing_cycle_day: null,
          deactivation_date: null,
          deactivation_reason: null,
          replacement_reason: null,
          notes: null
        };

        successfulImports.push(simData);
      } catch (error: any) {
        errors.push({
          row: rowNum,
          field: "General",
          message: error.message || "Error processing row",
          value: JSON.stringify(row)
        });
      }
    }

    for (const simData of successfulImports) {
      try {
        await simService.createSimCard(simData);
      } catch (error: any) {
        errors.push({
          row: 0,
          field: "Import",
          message: `Failed to import ${simData.phone_number}: ${error.message}`,
          value: simData.phone_number
        });
      }
    }

    loadSimCards();

    return {
      success: successfulImports.length - errors.filter(e => e.row === 0).length,
      failed: errors.length + duplicates.length,
      errors,
      duplicates
    };
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getActionDialogTitle = () => {
    switch (actionDialog.type) {
      case "activate":
        return "Aktivasi Kartu SIM";
      case "install":
        return "Instalasi Kartu SIM";
      case "grace_period":
        return "Masukkan Ke Periode Pengingat";
      case "reactivate":
        return "Reaktivasi Kartu SIM";
      case "deactivate":
        return "Non-aktifkan Kartu SIM";
      default:
        return "";
    }
  };

  const getActionDialogDescription = () => {
    switch (actionDialog.type) {
      case "activate":
        return "Konfirmasi aktivasi kartu SIM. Status akan berubah dari WAREHOUSE ke ACTIVATED.";
      case "install":
        return "Masukkan IMEI device dan tanggal instalasi untuk menginstall kartu SIM.";
      case "grace_period":
        return "Masukkan tanggal dan batas bayar langganan pulsa untuk periode pengingat.";
      case "reactivate":
        return "Konfirmasi reaktivasi kartu SIM setelah pembayaran diterima.";
      case "deactivate":
        return "Masukkan alasan deaktivasi kartu SIM.";
      default:
        return "";
    }
  };

  const getStatusCount = (status: SimStatus | "ALL") => {
    if (status === "ALL") return simCards.length;
    return simCards.filter(sim => sim.status === status).length;
  };

  return (
    <Layout>
      <SEO 
        title="SIM Cards - BKT-SimCare"
        description="Manage your SIM cards"
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">SIM Cards Management</h1>
            <p className="text-muted-foreground">
              Manage your SIM card inventory and lifecycle
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Excel
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add SIM Card
            </Button>
          </div>
        </div>

        {/* Status Tabs Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Status</CardTitle>
            <CardDescription>Click on a status to filter SIM cards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "ALL" ? "default" : "outline"}
                onClick={() => setStatusFilter("ALL")}
                className="gap-2"
              >
                All SIM Cards
                <Badge variant="secondary" className="ml-2">
                  {getStatusCount("ALL")}
                </Badge>
              </Button>
              
              <Button
                variant={statusFilter === "WAREHOUSE" ? "default" : "outline"}
                onClick={() => setStatusFilter("WAREHOUSE")}
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                Warehouse
                <Badge variant="secondary" className="ml-2">
                  {getStatusCount("WAREHOUSE")}
                </Badge>
              </Button>
              
              <Button
                variant={statusFilter === "ACTIVATED" ? "default" : "outline"}
                onClick={() => setStatusFilter("ACTIVATED")}
                className="gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Activated
                <Badge variant="secondary" className="ml-2">
                  {getStatusCount("ACTIVATED")}
                </Badge>
              </Button>
              
              <Button
                variant={statusFilter === "INSTALLED" ? "default" : "outline"}
                onClick={() => setStatusFilter("INSTALLED")}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Installed
                <Badge variant="secondary" className="ml-2">
                  {getStatusCount("INSTALLED")}
                </Badge>
              </Button>
              
              <Button
                variant={statusFilter === "GRACE_PERIOD" ? "default" : "outline"}
                onClick={() => setStatusFilter("GRACE_PERIOD")}
                className="gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Grace Period
                <Badge variant="secondary" className="ml-2">
                  {getStatusCount("GRACE_PERIOD")}
                </Badge>
              </Button>
              
              <Button
                variant={statusFilter === "DEACTIVATED" ? "default" : "outline"}
                onClick={() => setStatusFilter("DEACTIVATED")}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Deactivated
                <Badge variant="secondary" className="ml-2">
                  {getStatusCount("DEACTIVATED")}
                </Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add SIM Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New SIM Card</DialogTitle>
              <DialogDescription>
                Enter the details of the new SIM card to add to inventory.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone_number">No SIM Card *</Label>
                  <Input
                    id="phone_number"
                    placeholder="081234567890"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="iccid">ICCID (Opsional)</Label>
                  <Input
                    id="iccid"
                    placeholder="89620012345678901234"
                    value={formData.iccid}
                    onChange={(e) => setFormData({...formData, iccid: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider *</Label>
                  <Input
                    id="provider"
                    placeholder="Telkomsel"
                    value={formData.provider}
                    onChange={(e) => setFormData({...formData, provider: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plan_name">Plan Name</Label>
                  <Input
                    id="plan_name"
                    placeholder="Corporate 50GB"
                    value={formData.plan_name}
                    onChange={(e) => setFormData({...formData, plan_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value as SimStatus})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WAREHOUSE">WAREHOUSE</SelectItem>
                      <SelectItem value="ACTIVATED">ACTIVATED</SelectItem>
                      <SelectItem value="INSTALLED">INSTALLED</SelectItem>
                      <SelectItem value="BILLING">BILLING</SelectItem>
                      <SelectItem value="GRACE_PERIOD">GRACE_PERIOD</SelectItem>
                      <SelectItem value="DEACTIVATED">DEACTIVATED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="current_imei">Current IMEI</Label>
                  <Input
                    id="current_imei"
                    placeholder="123456789012345"
                    value={formData.current_imei}
                    onChange={(e) => setFormData({...formData, current_imei: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_cost">Monthly Cost (IDR)</Label>
                <Input
                  id="monthly_cost"
                  type="number"
                  placeholder="150000"
                  value={formData.monthly_cost}
                  onChange={(e) => setFormData({...formData, monthly_cost: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activation_date">Tanggal Aktivasi</Label>
                  <Input
                    id="activation_date"
                    type="date"
                    value={formData.activation_date}
                    onChange={(e) => setFormData({...formData, activation_date: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="installation_date">Tanggal Instalasi</Label>
                  <Input
                    id="installation_date"
                    type="date"
                    value={formData.installation_date}
                    onChange={(e) => setFormData({...formData, installation_date: e.target.value})}
                  />
                </div>
              </div>

              {formData.status === "DEACTIVATED" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="deactivation_date">Tanggal Deaktivasi</Label>
                    <Input
                      id="deactivation_date"
                      type="date"
                      value={formData.deactivation_date}
                      onChange={(e) => setFormData({...formData, deactivation_date: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deactivation_reason">Alasan Deaktivasi *</Label>
                    <Input
                      id="deactivation_reason"
                      placeholder="Contoh: Kontrak berakhir, Device rusak, dll"
                      value={formData.deactivation_reason}
                      onChange={(e) => setFormData({...formData, deactivation_reason: e.target.value})}
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSimCard}>
                Add SIM Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Dialog (Activate / Install / Grace Period / Reactivate / Deactivate) */}
        <Dialog open={actionDialog.isOpen} onOpenChange={closeActionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{getActionDialogTitle()}</DialogTitle>
              <DialogDescription>
                {getActionDialogDescription()}
              </DialogDescription>
            </DialogHeader>

            {actionDialog.sim && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">No SIM: {actionDialog.sim.phone_number}</div>
                  {actionDialog.sim.iccid && (
                    <div className="text-xs text-muted-foreground">ICCID: {actionDialog.sim.iccid}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Current Status: <Badge className={`${STATUS_COLORS[actionDialog.sim.status]} text-white`}>
                      {actionDialog.sim.status}
                    </Badge>
                  </div>
                </div>

                {actionDialog.type === "activate" && (
                  <div className="space-y-2">
                    <Label htmlFor="activate_date">Tanggal Aktivasi</Label>
                    <Input
                      id="activate_date"
                      type="date"
                      value={actionFormData.date}
                      onChange={(e) => setActionFormData({...actionFormData, date: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Status akan berubah dari WAREHOUSE → ACTIVATED
                    </p>
                  </div>
                )}

                {actionDialog.type === "install" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="install-date">Tanggal Instalasi</Label>
                      <Input
                        id="install-date"
                        type="date"
                        value={installationDate}
                        onChange={(e) => setInstallationDate(e.target.value)}
                        max={getTodayDate()}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Billing Cycle Reference</Label>
                      <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                        {/* Option 1: Existing Billing Cycle */}
                        <div className="flex items-start space-x-3">
                          <input
                            type="radio"
                            id="billing-existing"
                            name="billing-cycle"
                            value="existing"
                            checked={billingCycleOption === "existing"}
                            onChange={(e) => setBillingCycleOption(e.target.value as "existing" | "installation" | "custom")}
                            className="mt-1 h-4 w-4 cursor-pointer"
                          />
                          <label htmlFor="billing-existing" className="flex-1 cursor-pointer">
                            <div className="font-medium">Use Existing Billing Cycle Day</div>
                            <div className="text-sm text-muted-foreground">
                              Gunakan tanggal billing cycle yang sudah ada di sistem
                            </div>
                          </label>
                        </div>

                        {/* Option 2: Installation Date */}
                        <div className="flex items-start space-x-3">
                          <input
                            type="radio"
                            id="billing-installation"
                            name="billing-cycle"
                            value="installation"
                            checked={billingCycleOption === "installation"}
                            onChange={(e) => setBillingCycleOption(e.target.value as "existing" | "installation" | "custom")}
                            className="mt-1 h-4 w-4 cursor-pointer"
                          />
                          <label htmlFor="billing-installation" className="flex-1 cursor-pointer">
                            <div className="font-medium">Use Installation Date as Billing Day</div>
                            <div className="text-sm text-muted-foreground">
                              Tanggal instalasi akan menjadi billing cycle day (Day {new Date(installationDate).getDate()})
                            </div>
                          </label>
                        </div>

                        {/* Option 3: Custom Billing Day */}
                        <div className="flex items-start space-x-3">
                          <input
                            type="radio"
                            id="billing-custom"
                            name="billing-cycle"
                            value="custom"
                            checked={billingCycleOption === "custom"}
                            onChange={(e) => setBillingCycleOption(e.target.value as "existing" | "installation" | "custom")}
                            className="mt-1 h-4 w-4 cursor-pointer"
                          />
                          <label htmlFor="billing-custom" className="flex-1 cursor-pointer">
                            <div className="font-medium">Set Custom Billing Day</div>
                            <div className="text-sm text-muted-foreground">
                              Tentukan sendiri tanggal billing cycle (1-31)
                            </div>
                          </label>
                        </div>

                        {/* Conditional Input for Custom Day */}
                        {billingCycleOption === "custom" && (
                          <div className="ml-7 mt-2 space-y-2 border-l-2 border-primary pl-4">
                            <Label htmlFor="custom-billing-day" className="text-sm">
                              Billing Day (1-31)
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="custom-billing-day"
                                type="number"
                                min="1"
                                max="31"
                                value={customBillingDay}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (val >= 1 && val <= 31) {
                                    setCustomBillingDay(val);
                                  }
                                }}
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">
                                Every month on day {customBillingDay}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              💡 Tip: Pilih tanggal 1-28 untuk konsistensi di semua bulan
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imei">IMEI Device</Label>
                      <Input
                        id="imei"
                        type="text"
                        value={imei}
                        onChange={(e) => setImei(e.target.value)}
                        placeholder="Enter device IMEI"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="free-pulsa">Free Pulsa (months)</Label>
                      <Input
                        id="free-pulsa"
                        type="number"
                        min="0"
                        value={freePulsaMonths}
                        onChange={(e) => setFreePulsaMonths(parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground">
                        Jumlah bulan yang mendapat free pulsa
                      </p>
                    </div>
                  </>
                )}

                {actionDialog.type === "grace_period" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="grace_date">Tanggal</Label>
                      <Input
                        id="grace_date"
                        type="date"
                        value={actionFormData.date}
                        onChange={(e) => setActionFormData({...actionFormData, date: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due_date">Batas Bayar Langganan Pulsa *</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={actionFormData.dueDate}
                        onChange={(e) => setActionFormData({...actionFormData, dueDate: e.target.value})}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Tanggal jatuh tempo pembayaran sebelum kartu dinonaktifkan. Status akan berubah dari INSTALLED → GRACE_PERIOD
                      </p>
                    </div>
                  </>
                )}

                {actionDialog.type === "reactivate" && (
                  <div className="space-y-2">
                    <Label htmlFor="reactivate_date">Tanggal Reaktivasi</Label>
                    <Input
                      id="reactivate_date"
                      type="date"
                      value={actionFormData.date}
                      onChange={(e) => setActionFormData({...actionFormData, date: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Status akan berubah kembali ke INSTALLED setelah pembayaran diterima.
                    </p>
                  </div>
                )}

                {actionDialog.type === "deactivate" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="deactivate_date">Tanggal Deaktivasi</Label>
                      <Input
                        id="deactivate_date"
                        type="date"
                        value={actionFormData.date}
                        onChange={(e) => setActionFormData({...actionFormData, date: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deactivate_reason">Alasan Deaktivasi *</Label>
                      <Input
                        id="deactivate_reason"
                        placeholder="Contoh: Tidak ada pembayaran setelah grace period"
                        value={actionFormData.reason}
                        onChange={(e) => setActionFormData({...actionFormData, reason: e.target.value})}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Status akan berubah ke DEACTIVATED dan layanan dihentikan.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={closeActionDialog}>
                Batal
              </Button>
              <Button onClick={handleActionSubmit}>
                {actionDialog.type === "activate" && "Aktivasi"}
                {actionDialog.type === "install" && "Install"}
                {actionDialog.type === "grace_period" && "Simpan Grace Period"}
                {actionDialog.type === "reactivate" && "Reaktivasi"}
                {actionDialog.type === "deactivate" && "Non-aktifkan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone number, ICCID, or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* SIM Cards Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {statusFilter === "ALL" ? "All SIM Cards" : `${statusFilter} SIM Cards`} ({filteredSims.length})
                </CardTitle>
                <CardDescription>
                  {statusFilter !== "ALL" ? `Showing ${statusFilter} status` : "All SIM cards in the system"}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading SIM cards...
              </div>
            ) : filteredSims.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No SIM cards found. {statusFilter !== "ALL" && "Try selecting a different status tab."}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>No SIM Card</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Current IMEI</TableHead>
                      <TableHead>Monthly Cost</TableHead>
                      <TableHead className="text-right">Quick Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSims.map((sim) => {
                      const daysOverdue =
                        sim.status === "GRACE_PERIOD" &&
                        sim.grace_period_due_date
                          ? Math.floor(
                              (new Date().getTime() -
                                new Date(
                                  sim.grace_period_due_date
                                ).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : 0;

                      const graceCost = calculateGracePeriodCost(sim);

                      const daysColor =
                        daysOverdue <= 5
                          ? "text-green-600"
                          : daysOverdue <= 10
                            ? "text-yellow-600"
                            : "text-red-600";

                      const costColor =
                        daysOverdue <= 5
                          ? "text-green-600"
                          : daysOverdue <= 10
                            ? "text-yellow-600"
                            : "text-red-600";

                      return (
                        <TableRow key={sim.id}>
                          {/* Column 1: Status Badge */}
                          <TableCell>
                            <div className="space-y-2">
                              <Badge
                                className={STATUS_COLORS[sim.status]}
                              >
                                {STATUS_ICONS[sim.status] && (
                                  <span className="mr-1">
                                    {STATUS_ICONS[sim.status]}
                                  </span>
                                )}
                                {sim.status === "GRACE_PERIOD"
                                  ? "Grace Period"
                                  : sim.status}
                              </Badge>
                              {sim.status === "GRACE_PERIOD" &&
                                sim.grace_period_due_date && (
                                  <div className="text-xs space-y-1">
                                    <div
                                      className={`font-medium ${daysColor}`}
                                    >
                                      Overdue: {daysOverdue} hari
                                    </div>
                                    <div className="text-muted-foreground">
                                      Due:{" "}
                                      {new Date(
                                        sim.grace_period_due_date
                                      ).toLocaleDateString("id-ID")}
                                    </div>
                                    <div
                                      className={`font-semibold ${costColor}`}
                                    >
                                      Biaya:{" "}
                                      {new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        minimumFractionDigits: 0,
                                      }).format(graceCost.gracePeriodCost)}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </TableCell>

                          {/* Column 2: No SIM Card (Phone Number) */}
                          <TableCell>
                            <span className="font-medium">
                              {sim.phone_number}
                            </span>
                          </TableCell>

                          {/* Column 3: Provider */}
                          <TableCell>{sim.provider}</TableCell>

                          {/* Column 4: Current IMEI */}
                          <TableCell>
                            {sim.current_imei ? (
                              <span className="font-mono text-xs">
                                {sim.current_imei}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic text-sm">
                                Not assigned
                              </span>
                            )}
                          </TableCell>

                          {/* Column 5: Monthly Cost */}
                          <TableCell>
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            }).format(sim.monthly_cost || 0)}
                          </TableCell>

                          {/* Column 6: Quick Actions */}
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {sim.status === "WAREHOUSE" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                  onClick={() =>
                                    openActionDialog("activate", sim)
                                  }
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Activate
                                </Button>
                              )}
                              {sim.status === "ACTIVATED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() =>
                                    openActionDialog("install", sim)
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Install
                                </Button>
                              )}
                              {sim.status === "INSTALLED" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                    onClick={() =>
                                      openActionDialog("grace_period", sim)
                                    }
                                  >
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Grace Period
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      openActionDialog("deactivate", sim)
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Deactivate
                                  </Button>
                                </>
                              )}
                              {sim.status === "GRACE_PERIOD" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={() =>
                                      openActionDialog("reactivate", sim)
                                    }
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Reaktivasi
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      openActionDialog("deactivate", sim)
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Non-Aktifkan
                                  </Button>
                                </>
                              )}
                              {sim.status === "DEACTIVATED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() =>
                                    openActionDialog("reactivate", sim)
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Reaktivasi
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  router.push(`/sim-cards/${sim.id}`)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
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
      </div>

      {/* Excel Import Dialog */}
      <ExcelImport
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportData}
        templateColumns={[
          { key: "phone_number", label: "No SIM Card", example: "081234567890" },
          { key: "iccid", label: "ICCID", example: "89620012345678901234" },
          { key: "provider", label: "Provider", example: "Telkomsel" },
          { key: "plan_name", label: "Package", example: "Unlimited Data" },
          { key: "monthly_cost", label: "Monthly Cost", example: "150000" },
          { key: "status", label: "Status", example: "WAREHOUSE" }
        ]}
        entityName="SIM Cards"
        downloadTemplateName="simcards"
      />
    </Layout>
  );
}