import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Users, Plus, Search, Mail, Phone, MapPin, Calendar, DollarSign, Edit, Trash2, MoreVertical, AlertCircle } from "lucide-react";
import { mockTenants, type Tenant } from "./mock-data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function TenantsView() {
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTenants = tenants.filter(t => t.status === "Active").length;
  const overdueTenants = tenants.filter(t => t.status === "Overdue").length;
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

  const handleDeleteTenant = (id: string) => {
    setTenants(tenants.filter(t => t.id !== id));
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
              <DialogDescription>Enter the tenant's information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-name">Full Name</Label>
                <Input id="tenant-name" placeholder="e.g., John Smith" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant-email">Email</Label>
                <Input id="tenant-email" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant-phone">Phone Number</Label>
                <Input id="tenant-phone" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant-unit">Assign Unit</Label>
                <Select>
                  <SelectTrigger id="tenant-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="u3">Sunset Apartments - A-103</SelectItem>
                    <SelectItem value="u8">Riverside Studios - C-302</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lease-start">Lease Start</Label>
                  <Input id="lease-start" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lease-end">Lease End</Label>
                  <Input id="lease-end" type="date" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Add Tenant</Button>
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
                          onClick={() => handleDeleteTenant(tenant.id)}
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
          {filteredTenants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tenants found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
