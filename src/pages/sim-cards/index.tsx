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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { simService } from "@/services/simService";
import { SimCard, SimStatus } from "@/lib/supabase";
import Link from "next/link";

const STATUS_COLORS: Record<SimStatus, string> = {
  WAREHOUSE: "bg-gray-500",
  ACTIVATED: "bg-blue-500",
  INSTALLED: "bg-green-500",
  BILLING: "bg-purple-500",
  GRACE_PERIOD: "bg-yellow-500",
  DEACTIVATED: "bg-red-500"
};

export default function SimCardsPage() {
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [filteredSims, setFilteredSims] = useState<SimCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SimStatus | "ALL">("ALL");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    iccid: "",
    phone_number: "",
    provider: "",
    plan_name: "",
    status: "WAREHOUSE" as SimStatus,
    current_imei: "",
    monthly_cost: "",
    notes: ""
  });

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
        sim.iccid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      const newSim = {
        iccid: formData.iccid,
        phone_number: formData.phone_number || null,
        provider: formData.provider,
        plan_name: formData.plan_name || null,
        status: formData.status,
        current_imei: formData.current_imei || null,
        activation_date: null,
        installation_date: null,
        deactivation_date: null,
        billing_cycle_day: null,
        monthly_cost: Number(formData.monthly_cost) || 0,
        accumulated_cost: 0,
        notes: formData.notes || null,
        is_reactivated: false,
        replacement_reason: null
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
      iccid: "",
      phone_number: "",
      provider: "",
      plan_name: "",
      status: "WAREHOUSE",
      current_imei: "",
      monthly_cost: "",
      notes: ""
    });
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

  return (
    <Layout>
      <SEO 
        title="SIM Cards - BKT-SimCare"
        description="Manage your SIM cards"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SIM Cards</h1>
            <p className="text-muted-foreground">
              Manage and track your SIM card inventory
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add SIM Card
              </Button>
            </DialogTrigger>
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
                    <Label htmlFor="iccid">ICCID *</Label>
                    <Input
                      id="iccid"
                      placeholder="89620012345678901234"
                      value={formData.iccid}
                      onChange={(e) => setFormData({...formData, iccid: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      placeholder="081234567890"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
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
        </div>

        {/* Filters & Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ICCID, phone number, or provider..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SimStatus | "ALL")}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="WAREHOUSE">WAREHOUSE</SelectItem>
                  <SelectItem value="ACTIVATED">ACTIVATED</SelectItem>
                  <SelectItem value="INSTALLED">INSTALLED</SelectItem>
                  <SelectItem value="BILLING">BILLING</SelectItem>
                  <SelectItem value="GRACE_PERIOD">GRACE_PERIOD</SelectItem>
                  <SelectItem value="DEACTIVATED">DEACTIVATED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* SIM Cards Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>SIM Cards ({filteredSims.length})</CardTitle>
                <CardDescription>
                  {statusFilter !== "ALL" ? `Filtered by ${statusFilter}` : "All SIM cards in the system"}
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
                No SIM cards found. Add your first SIM card to get started.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ICCID</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IMEI</TableHead>
                      <TableHead>Biaya Bulanan</TableHead>
                      <TableHead>Akumulasi Biaya</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSims.map((sim) => (
                      <TableRow key={sim.id}>
                        <TableCell className="font-mono text-sm">
                          {sim.iccid}
                        </TableCell>
                        <TableCell>{sim.phone_number || "-"}</TableCell>
                        <TableCell>{sim.provider}</TableCell>
                        <TableCell>{sim.plan_name || "-"}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`${STATUS_COLORS[sim.status]} text-white`}
                          >
                            {sim.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {sim.current_imei || "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(sim.monthly_cost)}
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          {formatCurrency(sim.accumulated_cost)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/sim-cards/${sim.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Detail
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}