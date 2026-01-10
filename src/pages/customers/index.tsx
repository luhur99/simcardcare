import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Users, UserCheck, UserX, Edit, Phone, Mail, MapPin } from "lucide-react";
import { supabase, isSupabaseConnected, type Customer } from "@/lib/supabase";

type CustomerFormData = {
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  status: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    status: "ACTIVE"
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCustomers(data || []);
      } else {
        // Mock data for development
        const mockCustomers = getMockCustomers();
        setCustomers(mockCustomers);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      setCustomers(getMockCustomers());
    } finally {
      setLoading(false);
    }
  };

  const getMockCustomers = (): Customer[] => {
    const stored = localStorage.getItem("customers");
    if (stored) {
      return JSON.parse(stored);
    }

    const mock: Customer[] = [
      {
        id: "1",
        name: "PT Transportasi Nusantara",
        contact_person: "Budi Santoso",
        phone: "081234567890",
        email: "budi@transportasi.com",
        address: "Jl. Sudirman No. 123, Jakarta Pusat",
        status: "ACTIVE",
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "2",
        name: "CV Logistik Sejahtera",
        contact_person: "Siti Nurhaliza",
        phone: "081987654321",
        email: "siti@logistik.com",
        address: "Jl. Thamrin No. 456, Jakarta Selatan",
        status: "ACTIVE",
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "3",
        name: "PT Fleet Management Indonesia",
        contact_person: "Ahmad Hidayat",
        phone: "081122334455",
        email: "ahmad@fleet.com",
        address: "Jl. Gatot Subroto No. 789, Jakarta Barat",
        status: "INACTIVE",
        created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    localStorage.setItem("customers", JSON.stringify(mock));
    return mock;
  };

  const handleAddCustomer = async () => {
    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("customers").insert([formData]);
        if (error) throw error;
      } else {
        const newCustomer: Customer = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const updated = [...customers, newCustomer];
        setCustomers(updated);
        localStorage.setItem("customers", JSON.stringify(updated));
      }

      closeDialog();
      await loadCustomers();
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer. Please try again.");
    }
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase
          .from("customers")
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingCustomer.id);

        if (error) throw error;
      } else {
        const updated = customers.map(c =>
          c.id === editingCustomer.id
            ? { ...c, ...formData, updated_at: new Date().toISOString() }
            : c
        );
        setCustomers(updated);
        localStorage.setItem("customers", JSON.stringify(updated));
      }

      closeDialog();
      await loadCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer. Please try again.");
    }
  };

  const openAddDialog = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      status: "ACTIVE"
    });
    setDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      contact_person: customer.contact_person,
      phone: customer.phone,
      email: customer.email,
      address: customer.address || "",
      status: customer.status
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === "ACTIVE").length,
    inactive: customers.filter(c => c.status === "INACTIVE").length
  };

  return (
    <Layout>
      <SEO 
        title="Customers - BKT-SimCare"
        description="Manage your customer database"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage your customer database and track their assets
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Registered in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Customers</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Not currently active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Customers</CardTitle>
            <CardDescription>Search and filter customer list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search name, contact, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          </CardContent>
        </Card>

        {/* Customer Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>
              All registered customers in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading customers...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold">No customers found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new customer
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell>{customer.contact_person}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-sm">{customer.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{customer.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 max-w-[200px]">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{customer.address || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={customer.status === "ACTIVE" ? "default" : "secondary"}
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(customer)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
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

      {/* Add/Edit Customer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? "Update customer information"
                : "Enter customer details to register them in the system"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                placeholder="e.g., PT Transportasi Nusantara"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                placeholder="e.g., Budi Santoso"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="e.g., 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., contact@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="e.g., Jl. Sudirman No. 123, Jakarta Pusat"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customer-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="customer-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
              disabled={!formData.name || !formData.contact_person || !formData.phone || !formData.email}
            >
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}