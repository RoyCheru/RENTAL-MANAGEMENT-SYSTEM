import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { DollarSign, Plus, Search, Calendar, Receipt, TrendingUp, Download } from "lucide-react";
import { mockPayments, mockTenants, type Payment } from "./mock-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export function PaymentsView() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredPayments = payments.filter(payment =>
    payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCollected = payments
    .filter(p => p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const thisMonthPayments = payments.filter(p => p.date.startsWith("2026-02")).length;
  const thisMonthAmount = payments
    .filter(p => p.date.startsWith("2026-02") && p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const paymentMethodData = [
    { name: "Bank Transfer", value: payments.filter(p => p.method === "Bank Transfer").length, color: "#3b82f6" },
    { name: "Mobile Money", value: payments.filter(p => p.method === "Mobile Money").length, color: "#8b5cf6" },
    { name: "Cash", value: payments.filter(p => p.method === "Cash").length, color: "#10b981" },
    { name: "Check", value: payments.filter(p => p.method === "Check").length, color: "#f59e0b" },
  ].filter(item => item.value > 0);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Pending":
        return "secondary";
      case "Failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case "Bank Transfer":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Mobile Money":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "Cash":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Check":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Payments</h1>
          <p className="text-muted-foreground">Track and manage rent payments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>Enter payment details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="payment-tenant">Tenant</Label>
                <Select>
                  <SelectTrigger id="payment-tenant">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTenants.filter(t => t.status !== "Moved Out").map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name} - {tenant.unitNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Amount</Label>
                <Input id="payment-amount" type="number" placeholder="e.g., 1500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-date">Payment Date</Label>
                <Input id="payment-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="mobile">Mobile Money</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-type">Payment Type</Label>
                <Select>
                  <SelectTrigger id="payment-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="late-fee">Late Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Record Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Collected</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">This Month</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${thisMonthAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{thisMonthPayments} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Average Payment</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${Math.round(totalCollected / payments.length).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">per transaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Payment Methods Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution by method</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest payment activity</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Receipt className="size-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm">{payment.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{payment.date}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="text-sm">${payment.amount.toLocaleString()}</p>
                      <Badge variant="outline" className={`text-xs ${getMethodBadgeColor(payment.method)}`}>
                        {payment.method}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Complete list of all payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.tenantName}</TableCell>
                  <TableCell>${payment.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getMethodBadgeColor(payment.method)}>
                      {payment.method}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.type}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Receipt className="size-4" />
                      Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredPayments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Receipt className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
