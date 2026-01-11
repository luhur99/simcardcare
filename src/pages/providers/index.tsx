import { useState, useEffect } from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Building2, Search } from "lucide-react";
import { providerService, Provider } from "@/services/providerService";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Form states
  const [providerName, setProviderName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    provider: Provider | null;
  }>({ open: false, provider: null });

  // Load providers
  const loadProviders = async () => {
    try {
      setIsLoading(true);
      const data = await providerService.getAllProviders();
      setProviders(data);
      setFilteredProviders(data);
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  // Search filter
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = providers.filter(
      (provider) =>
        provider.name.toLowerCase().includes(query) ||
        provider.contact_person?.toLowerCase().includes(query) ||
        provider.contact_email?.toLowerCase().includes(query)
    );
    setFilteredProviders(filtered);
  }, [searchQuery, providers]);

  // Open add dialog
  const openAddDialog = () => {
    setDialogMode("add");
    setSelectedProvider(null);
    resetForm();
    setIsDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (provider: Provider) => {
    setDialogMode("edit");
    setSelectedProvider(provider);
    setProviderName(provider.name);
    setContactPerson(provider.contact_person || "");
    setContactPhone(provider.contact_phone || "");
    setContactEmail(provider.contact_email || "");
    setNotes(provider.notes || "");
    setIsDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setProviderName("");
    setContactPerson("");
    setContactPhone("");
    setContactEmail("");
    setNotes("");
  };

  // Close dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
    setSelectedProvider(null);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!providerName.trim()) {
      alert("Provider name is required!");
      return;
    }

    try {
      if (dialogMode === "add") {
        await providerService.createProvider({
          name: providerName.trim(),
          contact_person: contactPerson.trim() || null,
          contact_phone: contactPhone.trim() || null,
          contact_email: contactEmail.trim() || null,
          notes: notes.trim() || null,
        });
      } else if (dialogMode === "edit" && selectedProvider) {
        await providerService.updateProvider(selectedProvider.id, {
          name: providerName.trim(),
          contact_person: contactPerson.trim() || null,
          contact_phone: contactPhone.trim() || null,
          contact_email: contactEmail.trim() || null,
          notes: notes.trim() || null,
        });
      }

      await loadProviders();
      closeDialog();
    } catch (error: any) {
      alert(error.message || "Error saving provider");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteDialog.provider) return;

    try {
      await providerService.deleteProvider(deleteDialog.provider.id);
      await loadProviders();
      setDeleteDialog({ open: false, provider: null });
    } catch (error: any) {
      alert(error.message || "Error deleting provider");
    }
  };

  // Get stats
  const totalProviders = providers.length;
  const activeProviders = providers.filter((p) => p.is_active).length;

  return (
    <Layout>
      <Head>
        <title>Providers - BKT SimCare</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
            <p className="text-muted-foreground">
              Manage SIM card providers and their information
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Providers
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProviders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Providers
              </CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProviders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Providers ({filteredProviders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading providers...
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery
                  ? "No providers found matching your search"
                  : "No providers yet. Add your first provider to get started!"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{provider.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {provider.contact_person || (
                          <span className="text-muted-foreground italic">
                            Not set
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {provider.contact_phone || (
                          <span className="text-muted-foreground italic">
                            Not set
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {provider.contact_email || (
                          <span className="text-muted-foreground italic">
                            Not set
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={provider.is_active ? "default" : "secondary"}
                        >
                          {provider.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(provider)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteDialog({ open: true, provider })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add" ? "Add New Provider" : "Edit Provider"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Enter provider information to add a new provider."
                : "Update provider information."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="provider-name">
                Provider Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="provider-name"
                placeholder="e.g., Telkomsel, Indosat, XL Axiata"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-person">Contact Person</Label>
              <Input
                id="contact-person"
                placeholder="e.g., John Doe"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-phone">Contact Phone</Label>
              <Input
                id="contact-phone"
                placeholder="e.g., 08123456789"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="e.g., contact@provider.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Additional information"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {dialogMode === "add" ? "Add Provider" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, provider: deleteDialog.provider })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the provider{" "}
              <span className="font-semibold">{deleteDialog.provider?.name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}