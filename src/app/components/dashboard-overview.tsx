import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  Home,
  Receipt,
  Wrench
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { mockTenants, mockProperties, mockPayments, mockMaintenanceRequests, monthlyRevenueData, occupancyData, paymentMethodData } from "./mock-data";
import { Badge } from "./ui/badge";

export function DashboardOverview() {
  // Calculate stats
  const totalProperties = mockProperties.length;
  const totalUnits = mockProperties.reduce((sum, p) => sum + p.units, 0);
  const occupiedUnits = mockProperties.reduce((sum, p) => sum + p.occupied_units, 0);
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  const totalRevenue = mockProperties.reduce((sum, p) => sum + p.total_rent, 0);
  const activeTenants = mockTenants.filter(t => t.status === "Active").length;
  const overdueTenants = mockTenants.filter(t => t.status === "Overdue").length;
  const totalArrears = mockTenants.reduce((sum, t) => sum + t.balance, 0);
  const recentPayments = mockPayments.slice(0, 5);
  const pendingMaintenance = mockMaintenanceRequests.filter(m => m.status === "Pending" || m.status === "In Progress").length;
  
  const currentMonthRevenue = monthlyRevenueData[monthlyRevenueData.length - 1];
  const collectionRate = Math.round((currentMonthRevenue.collected / currentMonthRevenue.revenue) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your properties.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Properties</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalUnits} total units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Occupancy Rate</CardTitle>
            <Home className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {occupiedUnits} of {totalUnits} units occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Monthly Revenue</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="size-3" />
              {collectionRate}% collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Tenants</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeTenants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueTenants > 0 && (
                <span className="text-red-600">{overdueTenants} overdue</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue vs collected payments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Expected" />
                <Bar dataKey="collected" fill="#10b981" name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy Distribution</CardTitle>
            <CardDescription>Current unit occupancy status</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent Payments */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest rent payments received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Receipt className="size-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm">{payment.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{payment.method} • {payment.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">${payment.amount.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs border-green-600 text-green-600">
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Stats</CardTitle>
            <CardDescription>Important updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {overdueTenants > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle className="size-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm">{overdueTenants} Overdue Payment{overdueTenants > 1 ? 's' : ''}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total arrears: ${totalArrears.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
              <Wrench className="size-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm">{pendingMaintenance} Pending Request{pendingMaintenance > 1 ? 's' : ''}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maintenance requiring attention
                </p>
              </div>
            </div>

            <div className="pt-2 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Collection Rate</span>
                <span>{collectionRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vacant Units</span>
                <span>{totalUnits - occupiedUnits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Arrears</span>
                <span className="text-red-600">${totalArrears.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
