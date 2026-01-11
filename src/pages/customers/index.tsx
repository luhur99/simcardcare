import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ExcelImport } from "@/components/ExcelImport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Users, Building2, UserCheck, Phone, Mail, MapPin, CreditCard, Edit, Upload } from "lucide-react";
import { supabase, isSupabaseConnected, type Customer } from "@/lib/supabase";

type CustomerFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  tax_id: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    tax_id: ""
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

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
        name: "Budi Santoso",
        email: "budi@transportasi.com",
        phone: "081234567890",
        address: "Jl. Sudirman No. 123, Jakarta Pusat",
        company: "PT Transportasi Nusantara",
        tax_id: "01.234.567.8-012.000",
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "2",
        name: "Siti Nurhaliza",
        email: "siti@logistik.com",
        phone: "081987654321",
        address: "Jl. Thamrin No. 456, Jakarta Selatan",
        company: "CV Logistik Sejahtera",
        tax_id: "02.345.678.9-123.000",
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "3",
        name: "Ahmad Hidayat",
        email: "ahmad@fleet.com",
        phone: "081122334455",
        address: "Jl. Gatot Subroto No. 789, Jakarta Barat",
        company: "PT Fleet Management Indonesia",
        tax_id: "03.456.789.0-234.000",
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
        const updated = [newCustomer, ...customers];
        setCustomers(updated);
        localStorage.setItem("customers", JSON.stringify(updated));
      }

      closeDialog();
      await loadCustomers();
    } catch (error) {
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
      resetForm();
    } catch (error) {
      alert("Failed to update customer. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      tax_id: ""
    });
  };

  const handleImportData = async (data: any[]) => {
    const errors: any[] = [];
    const duplicates: string[] = [];
    const successfulImports: any[] = [];
    
    // Get existing customer names/emails for duplicate check
    const existingEmails = new Set(
      customers.filter(c => c.email).map(c => c.email?.toLowerCase())
    );
    const importEmails = new Set();

    // Validate and process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Excel row number (accounting for header)

      try {
        // Extract data with various possible column names
        const name = String(row["Customer Name"] || row["Name"] || row["Nama"] || "").trim();
        const company = String(row["Company"] || row["Perusahaan"] || "").trim();
        const phone = String(row["Phone"] || row["Telepon"] || row["No HP"] || "").trim();
        const email = String(row["Email"] || "").trim().toLowerCase();
        const taxId = String(row["Tax ID"] || row["NPWP"] || "").trim();
        const address = String(row["Address"] || row["Alamat"] || "").trim();

        // Validation: Name is required
        if (!name) {
          errors.push({
            row: rowNum,
            field: "Name",
            message: "Customer name is required",
            value: name
          });
          continue;
        }

        // Check for duplicate email in existing data
        if (email && existingEmails.has(email)) {
          duplicates.push(`${email} (Row ${rowNum}) - Email already exists in database`);
          continue;
        }

        // Check for duplicate email within import file
        if (email && importEmails.has(email)) {
          duplicates.push(`${email} (Row ${rowNum}) - Duplicate email in import file`);
          continue;
        }

        // Add to import set
        if (email) importEmails.add(email);

        // Prepare customer data
        const customerData = {
          name: name,
          email: email || null,
          phone: phone || null,
          address: address || null,
          company: company || null,
          tax_id: taxId || null
        };

        successfulImports.push(customerData);
      } catch (error: any) {
        errors.push({
          row: rowNum,
          field: "General",
          message: error.message || "Error processing row",
          value: JSON.stringify(row)
        });
      }
    }

    // Import successful records
    for (const customerData of successfulImports) {
      try {
        if (isSupabaseConnected()) {
          const { error } = await supabase.from("customers").insert([customerData]);
          if (error) throw error;
        } else {
          const storedCustomers = localStorage.getItem("customers");
          const customers: Customer[] = storedCustomers ? JSON.parse(storedCustomers) : [];
          const newCustomer: Customer = {
            id: Math.random().toString(36).substring(2, 15),
            ...customerData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          customers.push(newCustomer);
          localStorage.setItem("customers", JSON.stringify(customers));
        }
      } catch (error: any) {
        errors.push({
          row: 0,
          field: "Import",
          message: `Failed to import ${customerData.name}: ${error.message}`,
          value: customerData.name
        });
      }
    }

    // Refresh data
    await loadCustomers();

    return {
      success: successfulImports.length - errors.filter(e => e.row === 0).length,
      failed: errors.length + duplicates.length,
      errors,
      duplicates
    };
  };

  const openAddDialog = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      tax_id: ""
    });
    setDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      company: customer.company || "",
      tax_id: customer.tax_id || ""
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
      (customer.company && customer.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchQuery)) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const stats = {
    total: customers.length,
    companies: customers.filter(c => c.company).length,
    individuals: customers.filter(c => !c.company).length
  };

  return (
    <Layout>
      <SEO 
        title="Customers - BKT-SimCare"
        description="Manage your customer database"
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground">
              Manage your customer database and company details
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Excel
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </div>
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
              <CardTitle className="text-sm font-medium">Corporate Clients</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.companies}</div>
              <p className="text-xs text-muted-foreground">
                With company details
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Individual Clients</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.individuals}</div>
              <p className="text-xs text-muted-foreground">
                Without company details
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Customers</CardTitle>
            <CardDescription>Search customer list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search name, company, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
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
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Tax ID (NPWP)</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.company || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {customer.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="font-mono text-xs">{customer.phone}</span>
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{customer.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.tax_id ? (
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono text-xs">{customer.tax_id}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 max-w-[200px]">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs truncate" title={customer.address || ""}>{customer.address || "-"}</span>
                          </div>
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
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Budi Santoso"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="e.g., PT Transportasi Nusantara"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="e.g., 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="tax_id">Tax ID (NPWP)</Label>
              <Input
                id="tax_id"
                placeholder="e.g., 01.234.567.8-012.000"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              />
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
              disabled={!formData.name}
            >
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excel Import Dialog */}
      <ExcelImport
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportData}
        templateColumns={[
          { key: "name", label: "Customer Name", example: "Budi Santoso" },
          { key: "company", label: "Company", example: "PT Transportasi Nusantara" },
          { key: "phone", label: "Phone", example: "081234567890" },
          { key: "email", label: "Email", example: "contact@company.com" },
          { key: "tax_id", label: "Tax ID (NPWP)", example: "01.234.567.8-012.000" },
          { key: "address", label: "Address", example: "Jl. Sudirman No. 123, Jakarta" }
        ]}
        entityName="Customers"
        downloadTemplateName="customers"
      />
    </Layout>
  );
}