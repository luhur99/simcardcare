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
import { simService } from "@/services/simService";
import { SimCard, SimStatus } from "@/lib/supabase";
import Link from "next/link";
import { ExcelImport } from "@/components/ExcelImport";
import { formatDate, formatCurrency, getGracePeriodStatus, getOverdueGracePeriodSims, calculateGracePeriodCost } from "@/services/simService";
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

type ActionType = "activate" | "install" | "grace_period" | "reactivate" | "deactivate" | "billing" | null;

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
  const [deactivationDate, setDeactivationDate] = useState(getTodayDate());

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
        free_pulsa: 0, // ⭐ NEW: Initialize free_pulsa
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
      // ⭐ NEW: Auto-use existing billing cycle, no form needed
      if (sim.billing_cycle_day) {
        handleGracePeriodAutoSubmit(sim);
        return; // Don't open dialog
      }
      // Fallback: if no billing cycle, show error
      alert("Billing cycle belum diset! Harap install SIM card terlebih dahulu.");
      return;
    } else if (action === "reactivate") {
      setReactivationDate(getTodayDate());
    } else if (action === "deactivate") {
      setDeactivationDate(getTodayDate());
    }
  };

  // ⭐ NEW: Auto-submit Grace Period without form
  const handleGracePeriodAutoSubmit = async (sim: SimCard) => {
    try {
      await simService.updateSimCard(sim.id, {
        status: "GRACE_PERIOD",
        grace_period_start_date: getTodayDate(), // FIXED property name
        // Use existing billing_cycle_day, no change
      });
      loadSimCards();
    } catch (error: any) {
      alert(error.message || "Error moving to Grace Period");
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
        // ⭐ Validate IMEI uniqueness
        if (!selectedImei.trim()) {
          alert("IMEI device wajib diisi!");
          return;
        }

        const isUnique = await validateImeiUnique(selectedImei, actionDialog.sim.id);
        if (!isUnique) {
          alert("❌ IMEI ini sudah terikat dengan kartu aktif lain! Silakan gunakan IMEI yang berbeda.");
          return;
        }

        // ⭐ Validate billing cycle is set
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
      } else if (actionDialog.type === "reactivate") {
        await simService.updateSimCard(actionDialog.sim.id, {
          status: "ACTIVATED",
          activation_date: reactivationDate,
        });
      } else if (actionDialog.type === "deactivate") {
        await simService.updateSimCard(actionDialog.sim.id, {
          status: "DEACTIVATED",
          deactivation_date: deactivationDate,
          current_imei: null,
        });
      }

      closeActionDialog();
      loadSimCards();
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

  // Move to Grace Period (when payment overdue after billing cycle day)
  const handleMoveToGracePeriod = async () => {
    if (!actionDialog.sim) return;

    try {
      setIsSubmitting(true);

      // NEW LOGIC:
      // Grace Period Start = Billing Cycle Day (tanggal jatuh tempo)
      // Batas Bayar = Billing Cycle Day (sama dengan Grace Period Start)
      // Admin harus manual deactivate dalam max 30 hari
      // Jika >30 hari, sistem kirim alert ke admin
      
      const billingDay = actionDialog.sim.billing_cycle_day;
      
      if (!billingDay) {
        toast({
          title: "Error",
          description: "Billing cycle day belum diset. Tidak bisa masuk Grace Period.",
          variant: "destructive"
        });
        return;
      }

      // Calculate grace period start date
      // Grace Period Start = Billing Cycle Day (tanggal jatuh tempo/batas bayar)
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      // Grace period start = billing day of current month (batas bayar)
      let gracePeriodStart = new Date(currentYear, currentMonth, billingDay);
      
      // If today is before billing day, use last month's billing day
      if (today.getDate() < billingDay) {
        gracePeriodStart = new Date(currentYear, currentMonth - 1, billingDay);
      }

      await simService.updateSimCard(actionDialog.sim.id, {
        status: "GRACE_PERIOD",
        grace_period_start_date: gracePeriodStart.toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Moved to Grace Period",
        description: `SIM Card ${actionDialog.sim.phone_number} sekarang dalam Grace Period. Grace Period Start (Batas Bayar): ${formatDate(gracePeriodStart)}. Admin harus deactivate secara manual jika customer tidak bayar dalam 30 hari.`,
        variant: "default"
      });

      await loadSimCards();
      setActionDialog({ isOpen: false, type: null, sim: null });
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

  return (
    <Layout>
      <SEO 
        title="SIM Cards - BKT-SimCare"
        description="Manage your SIM cards"
      />

      <div className="space-y-6">
        {/* Admin Alert Banner for Overdue Grace Period (>30 days) */}
        {overdueGraceSims.length > 0 && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-600">
              Admin Action Required - {overdueGraceSims.length} SIM Card{overdueGraceSims.length > 1 ? 's' : ''} Overdue
            </AlertTitle>
            <AlertDescription>
              <p className="text-sm mb-3">
                SIM Card berikut telah di Grace Period lebih dari 30 hari. Segera deactivate!
              </p>
              <div className="space-y-2">
                {overdueGraceSims.slice(0, 5).map((sim) => {
                  const graceStatus = getGracePeriodStatus(sim);
                  const graceCost = calculateGracePeriodCost(sim);
                  
                  return (
                    <div key={sim.id} className="flex items-center justify-between gap-4 p-2 bg-white dark:bg-gray-900 rounded border">
                      <div className="flex-1">
                        <div className="font-semibold">{sim.phone_number}</div>
                        <div className="text-xs text-muted-foreground">
                          {sim.provider} • Grace: {formatDate(sim.grace_period_start_date)} • {graceStatus.daysInGracePeriod} hari • {formatCurrency(graceCost.gracePeriodCost)}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openActionDialog(sim, "deactivate")}
                      >
                        Deactivate
                      </Button>
                    </div>
                  );
                })}
                
                {overdueGraceSims.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    + {overdueGraceSims.length - 5} lainnya.{' '}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => setStatusFilter("GRACE_PERIOD")}
                    >
                      Lihat semua
                    </Button>
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === "activate" && "Activate SIM Card"}
                {actionDialog.type === "install" && "Install SIM Card"}
                {actionDialog.type === "billing" && "Move to Billing Status"}
                {actionDialog.type === "grace_period" && "Move to Grace Period"}
                {actionDialog.type === "deactivate" && "Deactivate SIM Card"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {actionDialog.type === "activate" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="activation-date">Tanggal Aktivasi</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="installation-date">Tanggal Instalasi</Label>
                    <Input
                      id="installation-date"
                      type="date"
                      value={installationDate}
                      onChange={(e) => setInstallationDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      Billing Cycle Reference *
                      <span className="text-xs font-normal text-muted-foreground ml-2">
                        (Wajib diisi)
                      </span>
                    </Label>
                    
                    <RadioGroup
                      value={billingCycleReference}
                      onValueChange={(value) => setBillingCycleReference(value as "existing" | "installation" | "custom")}
                    >
                      <div className="space-y-3">
                        {/* Existing Provider Billing */}
                        <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value="existing" id="existing" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="existing" className="font-medium cursor-pointer">
                              Gunakan Billing Cycle Provider
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {providerBillingDay ? (
                                <>
                                  Provider <span className="font-semibold">{actionDialog.sim?.provider}</span>: <span className="font-semibold">Day {providerBillingDay}</span> setiap bulan
                                  <span className="text-xs block mt-1">(dari data provider)</span>
                                </>
                              ) : actionDialog.sim?.billing_cycle_day ? (
                                <>
                                  Saat ini: <span className="font-semibold">Day {actionDialog.sim.billing_cycle_day}</span> setiap bulan
                                  <span className="text-xs block mt-1">(dari data SIM card sebelumnya)</span>
                                </>
                              ) : (
                                <span className="text-amber-600">⚠️ Belum ada billing cycle default. Pilih opsi lain.</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Installation Date Billing */}
                        <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value="installation" id="installation" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="installation" className="font-medium cursor-pointer">
                              Gunakan Tanggal Instalasi
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Billing cycle = hari instalasi
                              {installationDate && (
                                <>
                                  <br />
                                  <span className="font-semibold">
                                    Day {new Date(installationDate).getDate()}
                                  </span> setiap bulan
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Custom Billing Day */}
                        <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value="custom" id="custom" className="mt-1" />
                          <div className="flex-1 space-y-2">
                            <Label htmlFor="custom" className="font-medium cursor-pointer">
                              Custom Billing Day
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Tentukan hari billing sendiri (1-31)
                            </p>
                            {billingCycleReference === "custom" && (
                              <div className="flex items-center gap-2 mt-2">
                                <Label htmlFor="custom-day" className="text-sm whitespace-nowrap">
                                  Day:
                                </Label>
                                <Input
                                  id="custom-day"
                                  type="number"
                                  min="1"
                                  max="31"
                                  placeholder="1-31"
                                  value={customBillingDay}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if ((val >= 1 && val <= 31) || e.target.value === "") {
                                      setCustomBillingDay(val || 1);
                                    }
                                  }}
                                  className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">
                                  setiap bulan
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="device-imei">IMEI Device *</Label>
                    <Input
                      id="device-imei"
                      placeholder="Masukkan IMEI device"
                      value={selectedImei}
                      onChange={(e) => setSelectedImei(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      IMEI harus unique, sistem akan validasi otomatis
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="free-months">Free Pulsa (Bulan Gratis)</Label>
                    <Select
                      value={freeMonths.toString()}
                      onValueChange={(value) => setFreeMonths(parseInt(value))}
                    >
                      <SelectTrigger id="free-months">
                        <SelectValue placeholder="Pilih jumlah bulan gratis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 Bulan (Tidak ada gratis)</SelectItem>
                        <SelectItem value="1">1 Bulan Gratis</SelectItem>
                        <SelectItem value="2">2 Bulan Gratis</SelectItem>
                        <SelectItem value="3">3 Bulan Gratis</SelectItem>
                      </SelectContent>
                    </Select>
                    {freeMonths > 0 && actionDialog.sim?.monthly_cost && (
                      <p className="text-xs text-muted-foreground">
                        Total biaya free pulsa: <span className="font-semibold">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(freeMonths * actionDialog.sim.monthly_cost)}
                        </span> ({freeMonths} bulan × {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(actionDialog.sim.monthly_cost)})
                      </p>
                    )}
                  </div>
                </div>
              )}

              {actionDialog.type === "billing" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Konfirmasi untuk memindahkan SIM card ke status Billing.
                  </p>
                </div>
              )}

              {actionDialog.type === "grace_period" && actionDialog.sim && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      Informasi Grace Period
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Billing Cycle Day:</span>
                        <span className="font-semibold">
                          Day {actionDialog.sim.billing_cycle_day} setiap bulan
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Grace Period Start:</span>
                        <span className="font-semibold">
                          {(() => {
                            const billingDay = actionDialog.sim.billing_cycle_day;
                            if (!billingDay) return "N/A";
                            const today = new Date();
                            let gracePeriodStart = new Date(today.getFullYear(), today.getMonth(), billingDay);
                            if (today.getDate() < billingDay) {
                              gracePeriodStart = new Date(today.getFullYear(), today.getMonth() - 1, billingDay);
                            }
                            return formatDate(gracePeriodStart.toISOString());
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Duration:</span>
                        <span className="font-semibold text-orange-600">30 hari</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ⚠️ Grace Period akan dimulai dari <strong>Billing Cycle Day</strong> yang sudah ditentukan. 
                    Admin harus melakukan deactivation manual jika customer tidak membayar dalam 30 hari.
                  </p>
                </div>
              )}

              {/* Deactivate Dialog */}
              <Dialog 
                open={actionDialog.isOpen && actionDialog.type === 'deactivate'} 
                onOpenChange={(open) => !open && setActionDialog({ isOpen: false, type: null, sim: null })}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deactivate SIM Card</DialogTitle>
                    <DialogDescription>
                      {actionDialog.sim?.status === 'GRACE_PERIOD' ? (
                        <>
                          <AlertTriangle className="inline-block w-4 h-4 mr-1 text-red-600" />
                          <span className="font-semibold">Grace Period Deactivation (Manual Admin Action)</span>
                          <p className="mt-2 text-sm">
                            SIM Card ini telah berada di Grace Period selama{' '}
                            <strong>{actionDialog.sim?.grace_period_start_date ? getGracePeriodStatus(actionDialog.sim).daysInGracePeriod : 0} hari</strong>.
                          </p>
                          <p className="mt-1 text-sm">
                            Dengan men-deactivate SIM Card ini, status akan berubah menjadi <strong>DEACTIVATED</strong> dan SIM tidak dapat digunakan lagi.
                          </p>
                          {actionDialog.sim?.grace_period_start_date && getGracePeriodStatus(actionDialog.sim).exceedsMaxDuration && (
                            <p className="mt-2 text-xs text-red-600 font-semibold bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200">
                              ⚠️ SIM ini sudah melewati batas maksimal 30 hari grace period. Segera lakukan deactivation!
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          Are you sure you want to deactivate this SIM card? This action will change the status to DEACTIVATED.
                        </>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              {actionDialog.type === "deactivate" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deactivation-date">Tanggal Deaktivasi</Label>
                    <Input
                      id="deactivation-date"
                      type="date"
                      value={deactivationDate}
                      onChange={(e) => setDeactivationDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deactivation-reason">Alasan Deaktivasi</Label>
                    <Input
                      id="deactivation-reason"
                      placeholder="Contoh: Kontrak habis, Device rusak"
                      value={actionFormData.reason}
                      onChange={(e) => setActionFormData({...actionFormData, reason: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeActionDialog}>
                Cancel
              </Button>
              <Button onClick={actionDialog.type === "grace_period" ? handleMoveToGracePeriod : handleActionSubmit}>
                {actionDialog.type === "activate" && "Activate"}
                {actionDialog.type === "install" && "Install"}
                {actionDialog.type === "billing" && "Move to Billing"}
                {actionDialog.type === "grace_period" && "Confirm Grace Period"}
                {actionDialog.type === "deactivate" && "Deactivate"}
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
                            {(() => {
                              const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                                WAREHOUSE: "secondary",
                                ACTIVATED: "default",
                                INSTALLED: "default",
                                BILLING: "default",
                                GRACE_PERIOD: "destructive",
                                DEACTIVATED: "outline"
                              };

                              // Calculate grace period status
                              const graceStatus = sim.status === 'GRACE_PERIOD' 
                                ? getGracePeriodStatus(sim) 
                                : null;

                              // Calculate grace period cost
                              const graceCost = sim.status === 'GRACE_PERIOD' 
                                ? calculateGracePeriodCost(sim) 
                                : null;

                              return (
                                <div className="flex flex-col gap-2">
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
                                  
                                  {/* Grace Period Details - Simple Design */}
                                  {sim.status === "GRACE_PERIOD" && graceStatus && graceCost && (
                                    <div className="text-xs space-y-1 text-muted-foreground">
                                      <div>
                                        <span className="font-semibold">Periode:</span> {formatDate(sim.grace_period_start_date)} s/d Sekarang
                                      </div>
                                      <div>
                                        <span className="font-semibold">Hari Overdue:</span> <span className="text-orange-600 font-bold">{graceCost.gracePeriodDays} hari</span>
                                      </div>
                                      <div>
                                        <span className="font-semibold">Tarif Harian:</span> {formatCurrency(graceCost.dailyRate)}/hari
                                      </div>
                                      <div>
                                        <span className="font-semibold">Biaya:</span> <span className="text-red-600 font-bold">{formatCurrency(graceCost.gracePeriodCost)}</span>
                                      </div>
                                      {graceStatus.exceedsMaxDuration && (
                                        <div className="text-red-600 font-semibold">
                                          ⚠️ OVERDUE {graceStatus.daysInGracePeriod - 30} hari!
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
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
                                    openActionDialog(sim, "activate")
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
                                    openActionDialog(sim, "install")
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
                                    onClick={() => {
                                      // Auto-calculate grace period based on billing_cycle_day
                                      setActionDialog({ isOpen: true, type: 'grace_period', sim: sim });
                                    }}
                                  >
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Grace Period
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      openActionDialog(sim, "deactivate")
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
                                      openActionDialog(sim, "reactivate")
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
                                      openActionDialog(sim, "deactivate")
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
                                    openActionDialog(sim, "reactivate")
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