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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Search, Download, Eye, Upload, AlertCircle, CheckCircle2, XCircle, PlayCircle, Package, AlertTriangle, Bell, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { simService, calculateGracePeriodCost, getGracePeriodStatus } from "@/services/simService";
import { SimCard, SimStatus } from "@/lib/supabase";
import Link from "next/link";
import { ExcelImport } from "@/components/ExcelImport";
import { formatDate, formatCurrency, getOverdueGracePeriodSims } from "@/services/simService";
import { useRouter } from "next/router";
import { providerService } from "@/services/providerService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

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

type ActionType = "activate" | "install" | "grace_period" | "reactivate" | null;

export default function SimCardsPage() {
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [filteredSims, setFilteredSims] = useState<SimCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SimStatus | "ALL">("ALL");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
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
  const [freeMonths, setFreeMonths] = useState<number>(0);
  const [billingCycleOption, setBillingCycleOption] = useState<"existing" | "installation" | "custom">("existing");
  const [customBillingDay, setCustomBillingDay] = useState<number>(1);
  const [billingCycleReference, setBillingCycleReference] = useState<"existing" | "installation" | "custom">("existing");
  const [selectedImei, setSelectedImei] = useState("");
  const [freePulsa, setFreePulsa] = useState("0");
  const [reactivationDate, setReactivationDate] = useState(getTodayDate());
  
  // Provider data for billing cycle reference
  const [providerBillingDay, setProviderBillingDay] = useState<number | null>(null);
  
  // Other Action States
  const [gracePeriodDate, setGracePeriodDate] = useState(getTodayDate());
  
  // Form State for Add SIM
  const [formData, setFormData] = useState({
    phone_number: "",
    iccid: "",
    provider: "",
    plan_name: "",
    purchase_date: "",
    billing_cycle_day: "",
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

  const [overdueGraceSims, setOverdueGraceSims] = useState<SimCard[]>([]);

  useEffect(() => {
    loadSimCards();
  }, []);

  useEffect(() => {
    filterSimCards();
  }, [simCards, searchQuery, statusFilter]);

  // Check for overdue grace period SIMs (>30 days)
  useEffect(() => {
    const checkOverdueGrace = async () => {
      const overdue = await getOverdueGracePeriodSims();
      setOverdueGraceSims(overdue);
    };
    
    if (simCards.length > 0) {
      checkOverdueGrace();
    }
  }, [simCards]);

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
        purchase_date: formData.purchase_date || null,
        billing_cycle_day: formData.billing_cycle_day ? parseInt(formData.billing_cycle_day) : null,
        status: formData.status,
        current_imei: formData.current_imei || null,
        activation_date: formData.activation_date || null,
        installation_date: formData.installation_date || null,
        deactivation_date: formData.deactivation_date || null,
        deactivation_reason: formData.deactivation_reason || null,
        monthly_cost: Number(formData.monthly_cost) || 0,
        accumulated_cost: 0,
        notes: formData.notes || null,
        is_reactivated: false,
        replacement_reason: null,
        free_pulsa_months: null,
        free_pulsa: 0,
        grace_period_start_date: null,
        grace_period_due_date: null,
        reactivation_date: null
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
      purchase_date: "",
      billing_cycle_day: "",
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

  // Fetch provider billing cycle
  const fetchProviderBillingCycle = async (providerName: string) => {
    try {
      const providers = await providerService.getAllProviders();
      const provider = providers.find(p => p.name === providerName);
      setProviderBillingDay(provider?.billing_cycle_day || null);
    } catch (error) {
      console.error("Error fetching provider:", error);
      setProviderBillingDay(null);
    }
  };

  // Validate IMEI uniqueness
  const validateImeiUnique = async (imei: string, currentSimId: string): Promise<boolean> => {
    if (!imei.trim()) return true; // Empty IMEI is allowed for validation
    
    const allSims = await simService.getSimCards();
    const conflict = allSims.find(s => 
      s.id !== currentSimId && 
      s.current_imei === imei && 
      s.status !== 'DEACTIVATED'
    );
    
    return !conflict;
  };

  const openActionDialog = (sim: SimCard, action: ActionType) => {
    setActionDialog({
      isOpen: true,
      type: action,
      sim: sim,
    });

    if (action === "activate") {
      setActivationDate(getTodayDate());
    } else if (action === "install") {
      setInstallationDate(getTodayDate());
      setSelectedImei("");
      setFreeMonths(0);
      setBillingCycleReference("existing");
      setCustomBillingDay(sim.billing_cycle_day || 1);
      
      // Fetch provider data to get billing cycle
      if (sim.provider) {
        fetchProviderBillingCycle(sim.provider);
      } else {
        setProviderBillingDay(null);
      }
    } else if (action === "grace_period") {
      // Auto-use existing billing cycle, no form needed
      if (sim.billing_cycle_day) {
        // We set the dialog state, but we might want to trigger automatically or show confirmation.
        // For now, let's just trigger it via the button logic or show confirmation dialog if preferred.
        // The previous code had a direct call, but let's keep it clean.
        // If we want to show a confirmation dialog, we can. If we want 1-click, we can call handleMoveToGracePeriod directly.
        // Based on user request "di tombol reaktivasi...", assuming Grace Period move is already handled.
        // However, the function handleMoveToGracePeriod uses actionDialog.sim
        // So we need to set the state first.
        // We can just proceed to open the dialog or call the function.
        // Let's modify handleMoveToGracePeriod to check billing day
      } else {
        alert("Billing cycle belum diset! Harap install SIM card terlebih dahulu.");
        closeActionDialog(); // Close if invalid
        return;
      }
    } else if (action === "reactivate") {
      setReactivationDate(getTodayDate());
    }
  };

  const handleActionSubmit = async () => {
    try {
      if (!actionDialog.sim) return;

      if (actionDialog.type === "activate") {
        await simService.updateSimCard(actionDialog.sim.id, {
          status: "ACTIVATED",
          activation_date: activationDate,
        });
      } else if (actionDialog.type === "install") {
        // Validate IMEI uniqueness
        if (!selectedImei.trim()) {
          alert("IMEI device wajib diisi!");
          return;
        }

        const isUnique = await validateImeiUnique(selectedImei, actionDialog.sim.id);
        if (!isUnique) {
          alert("❌ IMEI ini sudah terikat dengan kartu aktif lain! Silakan gunakan IMEI yang berbeda.");
          return;
        }

        // Validate billing cycle is set
        let finalBillingDay: number;
        let billingSource: "provider" | "installation" | "custom";

        if (billingCycleReference === "existing") {
          if (!actionDialog.sim.billing_cycle_day && !providerBillingDay) {
            alert("Billing cycle belum diset! Pilih Installation Date atau Custom.");
            return;
          }
          finalBillingDay = actionDialog.sim.billing_cycle_day || providerBillingDay || 1;
          billingSource = "provider";
        } else if (billingCycleReference === "installation") {
          const instDate = new Date(installationDate);
          finalBillingDay = instDate.getDate();
          billingSource = "installation";
        } else {
          // custom
          if (!customBillingDay || customBillingDay < 1 || customBillingDay > 31) {
            alert("Custom billing day harus antara 1-31!");
            return;
          }
          finalBillingDay = customBillingDay;
          billingSource = "custom";
        }

        // Calculate free pulsa cost (freeMonths * monthly_cost)
        const freePulsaCost = freeMonths * (actionDialog.sim.monthly_cost || 0);

        await simService.updateSimCard(actionDialog.sim.id, {
          status: "INSTALLED",
          installation_date: installationDate,
          current_imei: selectedImei,
          billing_cycle_day: finalBillingDay,
          billing_cycle_source: billingSource,
          free_pulsa_months: freeMonths,
          free_pulsa: freePulsaCost,
        });
      } else if (actionDialog.type === "grace_period") {
        await handleMoveToGracePeriod(); // Delegate to specialized function
        return; // Don't run common cleanup yet, let the function handle it
      } else if (actionDialog.type === "reactivate") {
        // Reactivation: Move back to INSTALLED, preserve data, track date
        await simService.updateSimCard(actionDialog.sim.id, {
          status: "INSTALLED",
          reactivation_date: reactivationDate,
          grace_period_start_date: null, // Clear grace period status
          is_reactivated: true
        });
      }

      closeActionDialog();
      loadSimCards();
    } catch (error: any) {
      alert(error.message || "Error processing action");
    }
  };

  const handleMoveToGracePeriod = async () => {
    if (!actionDialog.sim) return;
  
    try {
      setIsSubmitting(true);
  
      const billingDay = actionDialog.sim.billing_cycle_day;
      
      if (!billingDay) {
        toast({
          title: "Error",
          description: "Billing cycle day belum diset.",
          variant: "destructive"
        });
        return;
      }
  
      // Calculate grace period start date (billing day of current or last month)
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); // 0-indexed
      const currentDay = today.getDate();
      
      let targetYear = currentYear;
      let targetMonth = currentMonth;
      
      // If today's day is before billing day, use last month
      if (currentDay < billingDay) {
        if (currentMonth === 0) {
          targetYear = currentYear - 1;
          targetMonth = 11;
        } else {
          targetMonth = currentMonth - 1;
        }
      }
  
      // Explicit date formatting YYYY-MM-DD
      const monthStr = String(targetMonth + 1).padStart(2, '0');
      const dayStr = String(billingDay).padStart(2, '0');
      const gracePeriodStartStr = `${targetYear}-${monthStr}-${dayStr}`;
  
      await simService.updateSimCard(actionDialog.sim.id, {
        status: "GRACE_PERIOD",
        grace_period_start_date: gracePeriodStartStr,
        updated_at: new Date().toISOString()
      });
  
      toast({
        title: "Moved to Grace Period",
        description: `Grace Period Start: ${formatDate(gracePeriodStartStr)}`,
        variant: "default"
      });
  
      await loadSimCards();
      closeActionDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move to grace period",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
        return "Konfirmasi untuk memindahkan SIM ke status Grace Period.";
      case "reactivate":
        return "Konfirmasi reaktivasi kartu SIM setelah pembayaran diterima. Status akan kembali ke INSTALLED dengan data device sebelumnya.";
      default:
        return "";
    }
  };

  const getStatusCount = (status: SimStatus | "ALL") => {
    if (status === "ALL") return simCards.length;
    return simCards.filter(sim => sim.status === status).length;
  };

  return (
    <Layout title="Management SIM Cards">
      <SEO title="SIM Cards - BKT Simcard Care" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Management SIM Cards</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Import Excel
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add SIM Card
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SIMs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount("ALL")}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warehouse</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount("WAREHOUSE")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activated</CardTitle>
            <PlayCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount("ACTIVATED")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Installed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount("INSTALLED")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grace Period</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount("GRACE_PERIOD")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deactivated</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount("DEACTIVATED")}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone number, ICCID, or provider..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as SimStatus | "ALL")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
            <SelectItem value="ACTIVATED">Activated</SelectItem>
            <SelectItem value="INSTALLED">Installed</SelectItem>
            <SelectItem value="GRACE_PERIOD">Grace Period</SelectItem>
            <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone Number</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IMEI / Device</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Key Dates</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No SIM cards found
                </TableCell>
              </TableRow>
            ) : (
              filteredSims.map((sim) => (
                <TableRow key={sim.id}>
                  <TableCell className="font-medium">
                    <Link href={`/sim-cards/${sim.id}`} className="hover:underline flex flex-col">
                      <span>{sim.phone_number}</span>
                      {sim.iccid && <span className="text-xs text-muted-foreground">{sim.iccid}</span>}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{sim.provider}</span>
                      {sim.plan_name && <span className="text-xs text-muted-foreground">{sim.plan_name}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[sim.status]}>
                      <span className="flex items-center gap-1">
                        {STATUS_ICONS[sim.status]}
                        {sim.status.replace("_", " ")}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sim.current_imei ? (
                      <span className="font-mono text-sm">{sim.current_imei}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatCurrency(sim.monthly_cost)}</span>
                      {sim.billing_cycle_day && (
                        <span className="text-xs text-muted-foreground">
                          Bill Cycle: Day {sim.billing_cycle_day}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-muted-foreground gap-1">
                      {sim.installation_date && (
                        <span>Install: {formatDate(sim.installation_date)}</span>
                      )}
                      {sim.grace_period_start_date && sim.status === 'GRACE_PERIOD' && (
                        <span className="text-yellow-600 font-medium">
                          Grace: {formatDate(sim.grace_period_start_date)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/sim-cards/${sim.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {sim.status === "WAREHOUSE" && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => openActionDialog(sim, "activate")}
                          title="Activate"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                      )}

                      {sim.status === "ACTIVATED" && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => openActionDialog(sim, "install")}
                          title="Install"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}

                      {sim.status === "INSTALLED" && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-yellow-600 hover:text-yellow-700"
                          onClick={() => openActionDialog(sim, "grace_period")}
                          title="Grace Period"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      )}

                      {sim.status === "GRACE_PERIOD" && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => openActionDialog(sim, "reactivate")}
                          title="Reactivate"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}

                      {(sim.status !== "DEACTIVATED" && sim.status !== "WAREHOUSE") && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={async () => {
                            if (confirm(`Yakin ingin non-aktifkan SIM ${sim.phone_number}?`)) {
                              try {
                                await simService.updateSimCard(sim.id, {
                                  status: "DEACTIVATED",
                                  deactivation_date: getTodayDate(),
                                  current_imei: null,
                                });
                                loadSimCards();
                              } catch (error: any) {
                                alert(error.message || "Error deactivating SIM");
                              }
                            }
                          }}
                          title="Deactivate"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add SIM Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New SIM Card</DialogTitle>
            <DialogDescription>
              Enter the details of the new SIM card.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="col-span-3"
                placeholder="081234567890"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="iccid" className="text-right">
                ICCID
              </Label>
              <Input
                id="iccid"
                value={formData.iccid}
                onChange={(e) => setFormData({ ...formData, iccid: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="provider" className="text-right">
                Provider
              </Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="col-span-3"
                placeholder="Telkomsel"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan" className="text-right">
                Plan Name
              </Label>
              <Input
                id="plan"
                value={formData.plan_name}
                onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchase_date" className="text-right">
                Tanggal Pembelian
              </Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="billing_cycle_day" className="text-right">
                Billing Cycle Day
              </Label>
              <Input
                id="billing_cycle_day"
                type="number"
                min={1}
                max={31}
                placeholder="1-31"
                value={formData.billing_cycle_day}
                onChange={(e) => setFormData({ ...formData, billing_cycle_day: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost" className="text-right">
                Monthly Cost
              </Label>
              <Input
                id="cost"
                type="number"
                value={formData.monthly_cost}
                onChange={(e) => setFormData({ ...formData, monthly_cost: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as SimStatus })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                  <SelectItem value="ACTIVATED">Activated</SelectItem>
                  <SelectItem value="INSTALLED">Installed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddSimCard}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialog.isOpen} onOpenChange={closeActionDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{getActionDialogTitle()}</DialogTitle>
            <DialogDescription>
              {getActionDialogDescription()}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {actionDialog.type === "activate" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="activation-date">Activation Date</Label>
                  <Input
                    id="activation-date"
                    type="date"
                    value={activationDate}
                    onChange={(e) => setActivationDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {actionDialog.type === "install" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="installation-date">Installation Date</Label>
                  <Input
                    id="installation-date"
                    type="date"
                    value={installationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="imei">IMEI Device</Label>
                  <Input
                    id="imei"
                    placeholder="Enter IMEI"
                    value={selectedImei}
                    onChange={(e) => setSelectedImei(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="billing-cycle">Billing Cycle Reference</Label>
                  <RadioGroup value={billingCycleReference} onValueChange={(val: "existing" | "installation" | "custom") => setBillingCycleReference(val)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id="bc-existing" />
                      <Label htmlFor="bc-existing">Provider Default ({providerBillingDay ? `Day ${providerBillingDay}` : 'Not set'})</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="installation" id="bc-installation" />
                      <Label htmlFor="bc-installation">Installation Date</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="bc-custom" />
                      <Label htmlFor="bc-custom">Custom Day</Label>
                    </div>
                  </RadioGroup>
                </div>
                {billingCycleReference === "custom" && (
                  <div className="grid gap-2 pl-6">
                    <Label htmlFor="custom-billing-day">Select Day (1-31)</Label>
                    <Input
                      id="custom-billing-day"
                      type="number"
                      min={1}
                      max={31}
                      value={customBillingDay}
                      onChange={(e) => setCustomBillingDay(parseInt(e.target.value))}
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="free-months">Free Pulsa (Months)</Label>
                  <Input
                    id="free-months"
                    type="number"
                    min={0}
                    value={freeMonths}
                    onChange={(e) => setFreeMonths(parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}

            {actionDialog.type === "grace_period" && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Konfirmasi</AlertTitle>
                  <AlertDescription>
                    Kartu SIM ini akan dipindahkan ke status <strong>Grace Period</strong>.
                    <br />
                    Billing Cycle Day: <strong>{actionDialog.sim?.billing_cycle_day || "N/A"}</strong>
                  </AlertDescription>
                </Alert>
                <div className="grid gap-2">
                  <Label>Tanggal Masuk Grace Period (Otomatis)</Label>
                  <div className="p-2 border rounded bg-muted text-sm text-muted-foreground">
                    Sesuai tanggal tagihan (Billing Cycle Day) pada bulan ini/lalu
                  </div>
                </div>
              </div>
            )}

            {actionDialog.type === "reactivate" && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-2">Data yang akan di-restore:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IMEI Device:</span>
                      <span className="font-mono font-medium">
                        {actionDialog.sim?.current_imei || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Installation Date:</span>
                      <span className="font-medium">
                        {actionDialog.sim?.installation_date 
                          ? formatDate(actionDialog.sim.installation_date)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Billing Cycle Day:</span>
                      <span className="font-medium">
                        Day {actionDialog.sim?.billing_cycle_day || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reactivation-date">Tanggal Reaktivasi</Label>
                  <Input
                    id="reactivation-date"
                    type="date"
                    value={reactivationDate}
                    onChange={(e) => setReactivationDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog}>
              Cancel
            </Button>
            <Button onClick={handleActionSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : 
                actionDialog.type === "activate" ? "Activate" :
                actionDialog.type === "install" ? "Install" :
                actionDialog.type === "grace_period" ? "Move to Grace Period" :
                "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExcelImport 
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportData}
        entityName="SIM Cards"
        downloadTemplateName="sim_cards_template"
        templateColumns={[
          { key: "Phone Number", label: "Phone Number", example: "081234567890" },
          { key: "ICCID", label: "ICCID", example: "8962..." },
          { key: "Provider", label: "Provider", example: "Telkomsel" },
          { key: "Package", label: "Package", example: "25GB" },
          { key: "Monthly Cost", label: "Monthly Cost", example: "150000" },
          { key: "Status", label: "Status", example: "WAREHOUSE" }
        ]}
      />
    </Layout>
  );
}