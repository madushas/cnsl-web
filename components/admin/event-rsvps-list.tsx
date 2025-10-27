"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  RSVPStatusBadge,
  RSVPStatusLegend,
} from "@/components/admin/rsvp-status-badge";
import { ActiveFiltersBar } from "@/components/admin/active-filter-badge";
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
import {
  Filter,
  Search,
  Loader2,
  CheckCircle,
  Linkedin,
  Twitter,
  Github,
  Globe,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { withCSRF } from "@/lib/csrf";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BulkTicketGenerator from "@/components/admin/bulk-ticket-generator";

type RSVP = {
  id: string;
  accountId?: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  notifiedAt?: string;
  ticketNumber?: string;
  checkedInAt?: string;
  affiliation?: string;
  qrCode?: string;
  ticketImageUrl?: string;
  checkpoints?: {
    hasEntry: boolean;
    hasRefreshment: boolean;
    hasSwag: boolean;
    entryScannedAt?: string | null;
    refreshmentScannedAt?: string | null;
    swagScannedAt?: string | null;
  };
  profile?: {
    linkedin?: string | null;
    twitter?: string | null;
    github?: string | null;
    website?: string | null;
    company?: string | null;
    title?: string | null;
  } | null;
};

type Props = {
  slug: string;
  capacity: number;
  title?: string;
  date?: string;
  venue?: string;
};

export default function EventRSVPsList({ slug, capacity, title, date, venue }: Props) {
  const { toast } = useToast();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRsvps, setSelectedRsvps] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);


  useEffect(() => {
    const ab = new AbortController();
    fetchData(ab.signal);
    return () => ab.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, searchQuery, statusFilter, page, pageSize]);

  // Keyboard shortcuts for bulk actions
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl + A to select all
      if ((e.metaKey || e.ctrlKey) && e.key === "a" && rsvps.length > 0) {
        e.preventDefault();
        if (selectedRsvps.size === rsvps.length) {
          setSelectedRsvps(new Set());
        } else {
          setSelectedRsvps(new Set(rsvps.map((r) => r.id)));
        }
      }
      // Escape to clear selection
      if (e.key === "Escape" && selectedRsvps.size > 0) {
        setSelectedRsvps(new Set());
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rsvps, selectedRsvps]);

  // Clear selection when filters change
  useEffect(() => {
    setSelectedRsvps(new Set());
  }, [searchQuery, statusFilter, page]);

  async function fetchData(signal?: AbortSignal) {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(
        `/api/admin/events/${slug}/rsvps?${params.toString()}`,
        { cache: "no-store", signal },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data?.error?.message || data?.error || "Failed to load RSVPs",
        );
      const payload = data?.data || data;
      setRsvps(Array.isArray(payload.items) ? payload.items : []);
      setTotal(Number(payload.total || 0));
      setApprovedCount(Number(payload.approvedCount || 0));
      setPendingCount(Number(payload.pendingCount || 0));
    } catch (error: any) {
      if (error.name === "AbortError") return;
      toast({
        title: "Error",
        description: error.message || "Failed to load RSVPs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Remove old exportAllUrl/exportSelectedUrl logic



  function toggleRsvpSelection(id: string) {
    const newSelection = new Set(selectedRsvps);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRsvps(newSelection);
  }

  function selectAll() {
    if (selectedRsvps.size === rsvps.length) setSelectedRsvps(new Set());
    else setSelectedRsvps(new Set(rsvps.map((r) => r.id)));
  }

  async function bulkUpdateStatus(status: string) {
    if (selectedRsvps.size === 0) {
      toast({
        title: "No RSVPs selected",
        description: "Please select at least one RSVP to update",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch(`/api/admin/events/${slug}/select`, {
        method: "POST",
        headers: withCSRF({ "Content-Type": "application/json" }),
        body: JSON.stringify({ rsvpIds: Array.from(selectedRsvps), status }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result?.error?.message || result?.error || "Failed to update status",
        );
      }
      const payload = result?.data || result;
      toast({
        title: "Status Updated",
        description: `Updated ${payload.updated || 0} RSVPs${payload.skipped?.length ? `, skipped ${payload.skipped.length} (capacity)` : ""}`,
      });
      await fetchData();
      setSelectedRsvps(new Set());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total,
    pending: pendingCount,
    approved: approvedCount,
    invited: rsvps.filter((r) => r.status === "invited").length,
    waitlist: rsvps.filter((r) => r.status === "waitlist").length,
    checkedIn: rsvps.filter((r) => r.checkedInAt).length,
  };

  return (
    <div className="space-y-6">
      {/* Bulk Ticket Generator */}
      <div className="flex justify-end">
        <BulkTicketGenerator
          eventId={slug}
          eventTitle={title || "Event"}
          eventDate={date || "TBD"}
          venue={venue || "TBD"}
          rsvps={rsvps.map((r) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            status: r.status,
            ticketNumber: r.ticketNumber,
            ticketImageUrl: r.ticketImageUrl || undefined,
          }))}
          onComplete={fetchData}
        />
      </div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Invited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invited}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waitlist}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedIn}</div>
          </CardContent>
        </Card>
      </div>

      {/* RSVP Status Legend */}
      <RSVPStatusLegend />

      {/* RSVP Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>
            Manage event registrations and track attendance · Capacity:{" "}
            {capacity || 0} · Approved: {approvedCount}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSelectedRsvps(new Set());
                    setSearchQuery(e.target.value);
                  }}
                  className="pl-9"
                  aria-label="Search RSVPs by name or email"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setSelectedRsvps(new Set());
                  setStatusFilter(v);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="waitlist">Waitlist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Indicator */}
          <ActiveFiltersBar
            filters={[
              ...(searchQuery
                ? [
                    {
                      label: "Search",
                      value: searchQuery,
                      onClear: () => setSearchQuery(""),
                    },
                  ]
                : []),
              ...(statusFilter !== "all"
                ? [
                    {
                      label: "Status",
                      value: statusFilter,
                      onClear: () => setStatusFilter("all"),
                    },
                  ]
                : []),
            ]}
            onClearAll={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
          />

          {/* Export Actions */}
          {/* Removed old export actions (CSV/manual workflow) */}

          {/* Enhanced Bulk Actions Bar */}
          {selectedRsvps.size > 0 && (
            <div className="sticky top-0 z-20 -mx-6 px-6 py-4 bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/20 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="text-base px-3 py-1.5 font-semibold"
                  >
                    {selectedRsvps.size}{" "}
                    {selectedRsvps.size === 1 ? "RSVP" : "RSVPs"} selected
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRsvps(new Set())}
                    className="h-7 text-xs"
                  >
                    Clear selection
                  </Button>
                </div>
                <div className="h-px sm:h-6 w-full sm:w-px bg-border" />
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    onClick={() => bulkUpdateStatus("approved")}
                    variant="default"
                    size="sm"
                    className="shadow-sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => bulkUpdateStatus("invited")}
                    variant="secondary"
                    size="sm"
                    className="shadow-sm"
                  >
                    Mark Invited
                  </Button>
                  <Button
                    onClick={() => bulkUpdateStatus("declined")}
                    variant="outline"
                    size="sm"
                    className="shadow-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                  >
                    Decline
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground ml-auto hidden sm:block">
                  <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">
                    Esc
                  </kbd>{" "}
                  to clear
                </div>
              </div>
            </div>
          )}

          {/* RSVP Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        rsvps.length > 0 && selectedRsvps.size === rsvps.length
                      }
                      onCheckedChange={selectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead className="text-center">📥 Entry</TableHead>
                  <TableHead className="text-center">🍕 Food</TableHead>
                  <TableHead className="text-center">🎁 Swag</TableHead>
                  <TableHead className="w-0">Profiles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rsvps.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No registrations found
                    </TableCell>
                  </TableRow>
                ) : (
                  rsvps.map((rsvp) => (
                    <TableRow
                      key={rsvp.id}
                      className={
                        selectedRsvps.has(rsvp.id)
                          ? "bg-primary/5 hover:bg-primary/10"
                          : ""
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRsvps.has(rsvp.id)}
                          onCheckedChange={() => toggleRsvpSelection(rsvp.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{rsvp.name}</TableCell>
                      <TableCell>{rsvp.email}</TableCell>
                      <TableCell>
                        <RSVPStatusBadge status={rsvp.status} />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {rsvp.ticketNumber || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(rsvp.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {rsvp.notifiedAt
                          ? new Date(rsvp.notifiedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>

                      {/* Checkpoint Status Columns (Read-only in list view) */}
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                {rsvp.checkpoints?.hasEntry ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 inline" />
                                ) : (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </span>
                            </TooltipTrigger>
                            {rsvp.checkpoints?.entryScannedAt && (
                              <TooltipContent>
                                {new Date(
                                  rsvp.checkpoints.entryScannedAt,
                                ).toLocaleString()}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                {rsvp.checkpoints?.hasRefreshment ? (
                                  <CheckCircle className="h-4 w-4 text-orange-600 inline" />
                                ) : (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </span>
                            </TooltipTrigger>
                            {rsvp.checkpoints?.refreshmentScannedAt && (
                              <TooltipContent>
                                {new Date(
                                  rsvp.checkpoints.refreshmentScannedAt,
                                ).toLocaleString()}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                {rsvp.checkpoints?.hasSwag ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 inline" />
                                ) : (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </span>
                            </TooltipTrigger>
                            {rsvp.checkpoints?.swagScannedAt && (
                              <TooltipContent>
                                {new Date(
                                  rsvp.checkpoints.swagScannedAt,
                                ).toLocaleString()}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {rsvp.profile?.linkedin && (
                            <a
                              href={rsvp.profile.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              title="LinkedIn Profile"
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          {rsvp.profile?.twitter && (
                            <a
                              href={rsvp.profile.twitter}
                              target="_blank"
                              rel="noreferrer"
                              title="Twitter Profile"
                              className="text-blue-400 hover:text-blue-600 transition-colors"
                            >
                              <Twitter className="h-4 w-4" />
                            </a>
                          )}
                          {rsvp.profile?.github && (
                            <a
                              href={rsvp.profile.github}
                              target="_blank"
                              rel="noreferrer"
                              title="GitHub Profile"
                              className="text-gray-800 hover:text-gray-600 transition-colors"
                            >
                              <Github className="h-4 w-4" />
                            </a>
                          )}
                          {rsvp.profile?.website && (
                            <a
                              href={rsvp.profile.website}
                              target="_blank"
                              rel="noreferrer"
                              title="Personal Website"
                              className="text-green-600 hover:text-green-800 transition-colors"
                            >
                              <Globe className="h-4 w-4" />
                            </a>
                          )}
                          {(!rsvp.profile?.linkedin && !rsvp.profile?.twitter && !rsvp.profile?.github && !rsvp.profile?.website) && (
                            <span className="text-xs text-muted-foreground">No profiles</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Page {page} of {Math.max(1, Math.ceil(total / pageSize))} ·{" "}
              {total} total
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const pc = Math.max(1, Math.ceil(total / pageSize));
                    setPage((p) => Math.min(pc, p + 1));
                  }}
                  disabled={page >= Math.max(1, Math.ceil(total / pageSize))}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const pc = Math.max(1, Math.ceil(total / pageSize));
                    setPage(pc);
                  }}
                  disabled={page >= Math.max(1, Math.ceil(total / pageSize))}
                >
                  Last
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
