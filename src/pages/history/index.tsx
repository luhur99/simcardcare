import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, ArrowRight, Calendar, Filter } from "lucide-react";
import { supabase, isSupabaseConnected } from "@/lib/supabase";
import type { StatusHistory, SimStatus } from "@/lib/supabase";

export default function HistoryPage() {
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<SimStatus | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Status labels and colors
  const statusLabels: Record<SimStatus, string> = {
    WAREHOUSE: "Warehouse",
    ACTIVATED: "Activated",
    INSTALLED: "Installed",
    BILLING: "Billing",
    GRACE_PERIOD: "Grace Period",
    DEACTIVATED: "Deactivated"
  };

  const statusColors: Record<SimStatus, string> = {
    WAREHOUSE: "bg-gray-500",
    ACTIVATED: "bg-blue-500",
    INSTALLED: "bg-green-500",
    BILLING: "bg-yellow-500",
    GRACE_PERIOD: "bg-orange-500",
    DEACTIVATED: "bg-red-500"
  };

  // Load history data
  useEffect(() => {
    loadHistory();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [history, searchTerm, statusFilter, dateFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from("status_history")
          .select(`
            *,
            sim_cards (
              iccid,
              phone_number,
              provider
            )
          `)
          .order("changed_at", { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } else {
        // Mock data for development
        const mockHistory: StatusHistory[] = [
          {
            id: "1",
            sim_card_id: "1",
            old_status: "WAREHOUSE",
            new_status: "ACTIVATED",
            changed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            changed_by: "admin@bkt.com",
            reason: "Initial activation"
          },
          {
            id: "2",
            sim_card_id: "1",
            old_status: "ACTIVATED",
            new_status: "INSTALLED",
            changed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            changed_by: "technician@bkt.com",
            reason: "Installed on vehicle #123"
          },
          {
            id: "3",
            sim_card_id: "2",
            old_status: "WAREHOUSE",
            new_status: "ACTIVATED",
            changed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            changed_by: "admin@bkt.com",
            reason: "Batch activation"
          },
          {
            id: "4",
            sim_card_id: "3",
            old_status: "INSTALLED",
            new_status: "DEACTIVATED",
            changed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            changed_by: "system",
            reason: "SIM Replacement"
          }
        ];
        setHistory(mockHistory);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Search filter (ICCID, phone number, reason)
    if (searchTerm) {
      filtered = filtered.filter((record) => {
        const iccid = record.sim_cards?.iccid || "";
        const phone = record.sim_cards?.phone_number || "";
        const reason = record.reason || "";
        const searchLower = searchTerm.toLowerCase();
        
        return (
          iccid.toLowerCase().includes(searchLower) ||
          phone.toLowerCase().includes(searchLower) ||
          reason.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (record) => record.new_status === statusFilter || record.old_status === statusFilter
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const days = parseInt(dateFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(
        (record) => new Date(record.changed_at) >= cutoffDate
      );
    }

    setFilteredHistory(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  const exportToCSV = () => {
    const headers = [
      "Timestamp",
      "ICCID",
      "Phone Number",
      "Provider",
      "Old Status",
      "New Status",
      "Changed By",
      "Reason"
    ];

    const rows = filteredHistory.map((record) => [
      formatDate(record.changed_at),
      record.sim_cards?.iccid || "-",
      record.sim_cards?.phone_number || "-",
      record.sim_cards?.provider || "-",
      statusLabels[record.old_status],
      statusLabels[record.new_status],
      record.changed_by || "system",
      record.reason || "-"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `status-history-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <SEO 
        title="Status History - BKT-SimCare"
        description="View complete history of SIM card status changes"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Status History</h1>
            <p className="text-muted-foreground">
              Track all SIM card status changes with detailed audit trail
            </p>
          </div>
          
          <Button onClick={exportToCSV} disabled={filteredHistory.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter history by search term, status, or date range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ICCID, phone, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SimStatus | "ALL")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                  <SelectItem value="ACTIVATED">Activated</SelectItem>
                  <SelectItem value="INSTALLED">Installed</SelectItem>
                  <SelectItem value="BILLING">Billing</SelectItem>
                  <SelectItem value="GRACE_PERIOD">Grace Period</SelectItem>
                  <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as typeof dateFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredHistory.length} of {history.length} records
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Status Change Log
            </CardTitle>
            <CardDescription>
              Complete audit trail of all status transitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading history...
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No history records found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>SIM Card</TableHead>
                      <TableHead>Status Change</TableHead>
                      <TableHead>Changed By</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(record.changed_at)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-mono text-sm">
                              {record.sim_cards?.iccid || "-"}
                            </span>
                            {record.sim_cards?.phone_number && (
                              <span className="text-xs text-muted-foreground">
                                {record.sim_cards.phone_number}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[record.old_status]}>
                              {statusLabels[record.old_status]}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <Badge className={statusColors[record.new_status]}>
                              {statusLabels[record.new_status]}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm">
                            {record.changed_by || "system"}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {record.reason || "-"}
                          </span>
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