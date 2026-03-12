import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Users, Plus, Search, Mail, Phone, DollarSign, Edit, Trash2, MoreVertical, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { createTenant, deactivateTenant, getTenants, type TenantListItem } from "../lib/services/tenants";

type TenantStatus = "Active" | "Overdue" | "Moved Out";

type DisplayTenant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitNumber: string;
  propertyName: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  balance: number;
  status: TenantStatus;
};

function toDisplayTenant(tenant: TenantListItem): DisplayTenant {
  const isActive = Boolean(tenant.user?.is_active);

  return {
    id: String(tenant.tenant_id),
    name: tenant.user?.full_name ?? "Unknown Tenant",
    email: tenant.user?.email ?? "—",
    phone: tenant.user?.phone ?? "—",
    unitNumber: "Unassigned",
    propertyName: "—",
    leaseStart: "—",
    leaseEnd: "—",
    rentAmount: 0,
    balance: 0,
    status: isActive ? "Active" : "Moved Out",
  };
}

export function TenantsView() {
  const [tenants, setTenants] = useState<DisplayTenant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTenant, setNewTenant] = useState({
    full_name: "",
    email: "",
    phone: "",
    lease_start: "",
    lease_end: "",
  });
  const [isSavingTenant, setIsSavingTenant] = useState(false);
  const [addTenantError, setAddTenantError] = useState<string | null>(null);

  const loadTenants = async (q?: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const res = await getTenants(q);
      setTenants((res.items ?? []).map(toDisplayTenant));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load tenants.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTenants();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadTenants(searchTerm.trim() || undefined);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const filteredTenants = useMemo(
    () => tenants.filter((tenant) => statusFilter === "all" || tenant.status === statusFilter),
    [tenants, statusFilter],
  );

  const activeTenants = tenants.filter((t) => t.status === "Active").length;
  const overdueTenants = tenants.filter((t) => t.status === "Overdue").length;
  const totalArrears = tenants.reduce((sum, t) => sum + t.balance, 0);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Overdue":
        return "destructive";
      case "Moved Out":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleDeleteTenant = async (id: string) => {
    try {
      await deactivateTenant(Number(id));
      setTenants((current) => current.map((t) => (t.id === id ? { ...t, status: "Moved Out" } : t)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to deactivate tenant.");
    }
  };

  const handleAddTenant = async () => {
    setAddTenantError(null);

    if (!newTenant.full_name.trim()) {
      setAddTenantError("Full Name is required.");
      return;
    }

    if (!newTenant.phone.trim()) {
      setAddTenantError("Phone Number is required.");
      return;
    }

    try {
      setIsSavingTenant(true);
      await createTenant({
        full_name: newTenant.full_name.trim(),
        phone: newTenant.phone.trim(),
        email: newTenant.email.trim() || undefined,
      });

      setIsAddDialogOpen(false);
      setNewTenant({
        full_name: "",
        email: "",
        phone: "",
        lease_start: "",
        lease_end: "",
      });

      await loadTenants(searchTerm.trim() || undefined);
    } catch (e: any) {
      setAddTenantError(e?.message ?? "Failed to add tenant.");
    } finally {
      setIsSavingTenant(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Tenants</h1>
          <p className="text-muted-foreground">Manage your tenant information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
              <DialogDescription>Enter the tenant&apos;s information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-name">Full Name</Label>
                <Input
                  id="tenant-name"
                  placeholder="e.g., John Smith"
                  value={newTenant.full_name}
                  onChange={(e) => setNewTenant((prev) => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant-email">Email</Label>
                <Input
                  id="tenant-email"
                  type="email"
                  placeholder="john@example.com"
                  value={newTenant.email}
                  onChange={(e) => setNewTenant((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant-phone">Phone Number</Label>
                <Input
                  id="tenant-phone"
                  placeholder="07xxxxxxxx"
                  value={newTenant.phone}
                  onChange={(e) => setNewTenant((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant-unit">Assign Unit</Label>
                <Select disabled>
                  <SelectTrigger id="tenant-unit">
                    <SelectValue placeholder="Not yet supported" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-supported">Not yet supported</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lease-start">Lease Start</Label>
                  <Input
                    id="lease-start"
                    type="date"
                    value={newTenant.lease_start}
                    onChange={(e) => setNewTenant((prev) => ({ ...prev, lease_start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lease-end">Lease End</Label>
                  <Input
                    id="lease-end"
                    type="date"
                    value={newTenant.lease_end}
                    onChange={(e) => setNewTenant((prev) => ({ ...prev, lease_end: e.target.value }))}
                  />
                </div>
              </div>
              {addTenantError && <p className="text-sm text-red-600">{addTenantError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTenant} disabled={isSavingTenant}>
                {isSavingTenant ? "Adding..." : "Add Tenant"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Tenants</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeTenants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Overdue Payments</CardTitle>
            <AlertCircle className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{overdueTenants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Arrears</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalArrears.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
            <SelectItem value="Moved Out">Moved Out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant List</CardTitle>
          <CardDescription>View and manage all tenants</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Lease Period</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm">{tenant.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{tenant.unitNumber}</p>
                      <p className="text-xs text-muted-foreground">{tenant.propertyName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs flex items-center gap-1">
                        <Mail className="size-3" />
                        {tenant.email}
                      </p>
                      <p className="text-xs flex items-center gap-1">
                        <Phone className="size-3" />
                        {tenant.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p>{tenant.leaseStart}</p>
                      <p className="text-muted-foreground">to {tenant.leaseEnd}</p>
                    </div>
                  </TableCell>
                  <TableCell>${tenant.rentAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={tenant.balance > 0 ? "text-red-600" : ""}>
                      ${tenant.balance.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(tenant.status)}>
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => void handleDeleteTenant(tenant.id)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && filteredTenants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tenants found</p>
            </div>
          )}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Loading tenants...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
