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
import { Plus, Search, Edit, Smartphone } from "lucide-react";
import { supabase, isSupabaseConnected } from "@/lib/supabase";
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
        device_type: "GPS Tracker",
        brand: "TechCorp",
        model: "GPS Tracker V1",
        serial_number: "SN-001",
        status: "AVAILABLE",
        customer_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "dev-2",
        imei: "987654321098765",
        device_type: "Fleet Monitor",
        brand: "FleetTech",
        model: "Fleet Monitor Pro",
        serial_number: "SN-002",
        status: "IN_USE",
        customer_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "dev-3",
        imei: "456789123456789",
        device_type: "GPS Tracker",
        brand: "TechCorp",
        model: "GPS Tracker V2",
        serial_number: "SN-003",
        status: "MAINTENANCE",
        customer_id: null,
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    imei: "",
    device_type: "",
    brand: "",
    model: "",
    serial_number: "",
    status: "AVAILABLE",
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
        const { data, error } = await supabase
          .from("devices")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        setDevices(data || []);
      } else {
        const mockData = await mockDeviceService.getDevices();
        setDevices(mockData);
      }
    } catch (error) {
      console.error("Error loading devices:", error);
      // Fallback to mock data on error
      const mockData = await mockDeviceService.getDevices();
      setDevices(mockData);
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
          (d.model && d.model.toLowerCase().includes(query)) ||
          (d.brand && d.brand.toLowerCase().includes(query)) ||
          (d.device_type && d.device_type.toLowerCase().includes(query))
      );
    }

    setFilteredDevices(filtered);
  };

  const openAddDialog = () => {
    setFormData({
      imei: "",
      device_type: "",
      brand: "",
      model: "",
      serial_number: "",
      status: "AVAILABLE",
    });
    setAddDialogOpen(true);
  };

  const openEditDialog = (device: Device) => {
    setSelectedDevice(device);
    setFormData({
      imei: device.imei,
      device_type: device.device_type || "",
      brand: device.brand || "",
      model: device.model || "",
      serial_number: device.serial_number || "",
      status: device.status || "AVAILABLE",
    });
    setEditDialogOpen(true);
  };

  const handleAddDevice = async () => {
    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("devices").insert([
          {
            ...formData,
            device_type: formData.device_type || null,
            brand: formData.brand || null,
            model: formData.model || null,
            serial_number: formData.serial_number || null,
          },
        ]);
        
        if (error) throw error;
      } else {
        await mockDeviceService.addDevice({
          ...formData,
          device_type: formData.device_type || null,
          brand: formData.brand || null,
          model: formData.model || null,
          serial_number: formData.serial_number || null,
          customer_id: null,
        });
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
        const { error } = await supabase
          .from("devices")
          .update({
            device_type: formData.device_type || null,
            brand: formData.brand || null,
            model: formData.model || null,
            serial_number: formData.serial_number || null,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedDevice.id);
        
        if (error) throw error;
      } else {
        await mockDeviceService.updateDevice(selectedDevice.id, {
          device_type: formData.device_type || null,
          brand: formData.brand || null,
          model: formData.model || null,
          serial_number: formData.serial_number || null,
          status: formData.status,
        });
      }
      await loadDevices();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating device:", error);
      alert("Failed to update device.");
    }
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "AVAILABLE":
        return "default";
      case "IN_USE":
        return "secondary";
      case "MAINTENANCE":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "AVAILABLE":
        return "Available";
      case "IN_USE":
        return "In Use";
      case "MAINTENANCE":
        return "Maintenance";
      default:
        return status || "Unknown";
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
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Smartphone className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {devices.filter((d) => d.status === "AVAILABLE").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready to use
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Use</CardTitle>
              <Smartphone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {devices.filter((d) => d.status === "IN_USE").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently deployed
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
                    placeholder="Search IMEI, model, brand, or type..."
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
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="IN_USE">In Use</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
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
                      <TableHead>Type</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Serial Number</TableHead>
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
                        <TableCell>{device.device_type || "-"}</TableCell>
                        <TableCell>{device.brand || "-"}</TableCell>
                        <TableCell>{device.model || "-"}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {device.serial_number || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(device.status)}>
                            {getStatusLabel(device.status)}
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
                maxLength={20}
                value={formData.imei}
                onChange={(e) =>
                  setFormData({ ...formData, imei: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-device-type">Device Type</Label>
              <Input
                id="add-device-type"
                placeholder="e.g., GPS Tracker, Fleet Monitor"
                value={formData.device_type}
                onChange={(e) =>
                  setFormData({ ...formData, device_type: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-brand">Brand</Label>
              <Input
                id="add-brand"
                placeholder="e.g., TechCorp, FleetTech"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-model">Model</Label>
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
              <Label htmlFor="add-serial">Serial Number</Label>
              <Input
                id="add-serial"
                placeholder="e.g., SN-001"
                value={formData.serial_number}
                onChange={(e) =>
                  setFormData({ ...formData, serial_number: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="add-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="IN_USE">In Use</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
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
                maxLength={20}
                value={formData.imei}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                IMEI cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-device-type">Device Type</Label>
              <Input
                id="edit-device-type"
                placeholder="e.g., GPS Tracker, Fleet Monitor"
                value={formData.device_type}
                onChange={(e) =>
                  setFormData({ ...formData, device_type: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-brand">Brand</Label>
              <Input
                id="edit-brand"
                placeholder="e.g., TechCorp, FleetTech"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-model">Model</Label>
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
              <Label htmlFor="edit-serial">Serial Number</Label>
              <Input
                id="edit-serial"
                placeholder="e.g., SN-001"
                value={formData.serial_number}
                onChange={(e) =>
                  setFormData({ ...formData, serial_number: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="IN_USE">In Use</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
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