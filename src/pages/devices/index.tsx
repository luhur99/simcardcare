import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Smartphone, Link as LinkIcon } from "lucide-react";
import { isSupabaseConnected } from "@/lib/supabase";
import type { Device } from "@/lib/supabase";

// Mock device service for localStorage mode
const mockDeviceService = {
  async getDevices(): Promise<Device[]> {
    const stored = localStorage.getItem("devices");
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Initial mock data
    const mockDevices: Device[] = [
      {
        id: "dev-1",
        imei: "123456789012345",
        model: "GPS Tracker V1",
        manufacturer: "TechCorp",
        purchase_date: "2025-01-15",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "dev-2",
        imei: "987654321098765",
        model: "Fleet Monitor Pro",
        manufacturer: "FleetTech",
        purchase_date: "2025-02-20",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "dev-3",
        imei: "456789123456789",
        model: "GPS Tracker V2",
        manufacturer: "TechCorp",
        purchase_date: "2024-12-10",
        status: "inactive",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    
    localStorage.setItem("devices", JSON.stringify(mockDevices));
    return mockDevices;
  },

  async addDevice(device: Omit<Device, "id" | "created_at" | "updated_at">): Promise<Device> {
    const devices = await this.getDevices();
    const newDevice: Device = {
      ...device,
      id: `dev-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    devices.push(newDevice);
    localStorage.setItem("devices", JSON.stringify(devices));
    return newDevice;
  },

  async updateDevice(id: string, updates: Partial<Device>): Promise<Device> {
    const devices = await this.getDevices();
    const index = devices.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Device not found");
    
    devices[index] = {
      ...devices[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem("devices", JSON.stringify(devices));
    return devices[index];
  },
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    imei: "",
    model: "",
    manufacturer: "",
    purchase_date: "",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    filterDevices();
  }, [devices, searchQuery, statusFilter]);

  const loadDevices = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        // TODO: Implement Supabase query when backend is ready
        // const { data } = await supabase.from("devices").select("*");
        // setDevices(data || []);
        const mockData = await mockDeviceService.getDevices();
        setDevices(mockData);
      } else {
        const mockData = await mockDeviceService.getDevices();
        setDevices(mockData);
      }
    } catch (error) {
      console.error("Error loading devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDevices = () => {
    let filtered = [...devices];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.imei.toLowerCase().includes(query) ||
          d.model.toLowerCase().includes(query) ||
          d.manufacturer.toLowerCase().includes(query)
      );
    }

    setFilteredDevices(filtered);
  };

  const openAddDialog = () => {
    setFormData({
      imei: "",
      model: "",
      manufacturer: "",
      purchase_date: new Date().toISOString().split("T")[0],
      status: "active",
    });
    setAddDialogOpen(true);
  };

  const openEditDialog = (device: Device) => {
    setSelectedDevice(device);
    setFormData({
      imei: device.imei,
      model: device.model,
      manufacturer: device.manufacturer,
      purchase_date: device.purchase_date || "",
      status: device.status,
    });
    setEditDialogOpen(true);
  };

  const handleAddDevice = async () => {
    try {
      if (isSupabaseConnected()) {
        // TODO: Implement Supabase insert
        await mockDeviceService.addDevice(formData);
      } else {
        await mockDeviceService.addDevice(formData);
      }
      await loadDevices();
      setAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding device:", error);
      alert("Failed to add device. IMEI must be unique.");
    }
  };

  const handleUpdateDevice = async () => {
    if (!selectedDevice) return;
    
    try {
      if (isSupabaseConnected()) {
        // TODO: Implement Supabase update
        await mockDeviceService.updateDevice(selectedDevice.id, formData);
      } else {
        await mockDeviceService.updateDevice(selectedDevice.id, formData);
      }
      await loadDevices();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating device:", error);
      alert("Failed to update device.");
    }
  };

  return (
    <Layout>
      <SEO 
        title="Devices - BKT-SimCare"
        description="Manage devices and IMEI assignments"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
            <p className="text-muted-foreground">
              Manage devices and IMEI assignments
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{devices.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
              <Smartphone className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {devices.filter((d) => d.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently in use
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Devices</CardTitle>
              <Smartphone className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {devices.filter((d) => d.status === "inactive").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Not in use
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Devices</CardTitle>
            <CardDescription>
              Search and filter device list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search IMEI, model, or manufacturer..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value: "all" | "active" | "inactive") =>
                    setStatusFilter(value)
                  }
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredDevices.length} of {devices.length} devices
            </div>
          </CardContent>
        </Card>

        {/* Devices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Device List</CardTitle>
            <CardDescription>
              All registered devices and their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading devices...
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="text-center py-8">
                <Smartphone className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No devices found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or add a new device
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IMEI</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDevices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-mono text-sm">
                          {device.imei}
                        </TableCell>
                        <TableCell>{device.model}</TableCell>
                        <TableCell>{device.manufacturer}</TableCell>
                        <TableCell>
                          {device.purchase_date
                            ? new Date(device.purchase_date).toLocaleDateString(
                                "id-ID"
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              device.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {device.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(device)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
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

      {/* Add Device Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>
              Register a new device in the system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-imei">IMEI *</Label>
              <Input
                id="add-imei"
                placeholder="15-digit IMEI number"
                maxLength={15}
                value={formData.imei}
                onChange={(e) =>
                  setFormData({ ...formData, imei: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-model">Model *</Label>
              <Input
                id="add-model"
                placeholder="e.g., GPS Tracker V1"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-manufacturer">Manufacturer *</Label>
              <Input
                id="add-manufacturer"
                placeholder="e.g., TechCorp"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-purchase-date">Purchase Date</Label>
              <Input
                id="add-purchase-date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="add-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDevice}>Add Device</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>
              Update device information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-imei">IMEI *</Label>
              <Input
                id="edit-imei"
                placeholder="15-digit IMEI number"
                maxLength={15}
                value={formData.imei}
                onChange={(e) =>
                  setFormData({ ...formData, imei: e.target.value })
                }
                disabled
              />
              <p className="text-xs text-muted-foreground">
                IMEI cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-model">Model *</Label>
              <Input
                id="edit-model"
                placeholder="e.g., GPS Tracker V1"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-manufacturer">Manufacturer *</Label>
              <Input
                id="edit-manufacturer"
                placeholder="e.g., TechCorp"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-purchase-date">Purchase Date</Label>
              <Input
                id="edit-purchase-date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateDevice}>Update Device</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}