import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Download, FileText, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { monthlyRevenueData, mockTenants, mockProperties, mockPayments } from "./mock-data";
import { Badge } from "./ui/badge";

export function ReportsView() {
  // Calculate report data
  const totalRevenue = mockProperties.reduce((sum, p) => sum + p.totalRent, 0);
  const totalCollected = mockPayments
    .filter(p => p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalArrears = mockTenants.reduce((sum, t) => sum + t.balance, 0);
  const collectionRate = Math.round((totalCollected / (totalRevenue * 6)) * 100); // 6 months of data

  const occupancyOverTime = [
    { month: "Aug", rate: 82 },
    { month: "Sep", rate: 85 },
    { month: "Oct", rate: 87 },
    { month: "Nov", rate: 90 },
    { month: "Dec", rate: 88 },
    { month: "Jan", rate: 92 },
    { month: "Feb", rate: 95 },
  ];

  const propertyPerformance = mockProperties.map(property => ({
    name: property.name.split(' ')[0],
    revenue: property.totalRent,
    occupancy: Math.round((property.occupiedUnits / property.units) * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">View detailed reports and export data</p>
        </div>
        <Button className="gap-2">
          <Download className="size-4" />
          Export All Reports
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly expected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Collected</CardTitle>
            <TrendingUp className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Collection Rate</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{collectionRate}%</div>
            <p className="text-xs text-muted-foreground">Average rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Arrears</CardTitle>
            <DollarSign className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">${totalArrears.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Monthly Income Report
            </CardTitle>
            <CardDescription>Detailed revenue breakdown by property</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Download className="size-4" />
              Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Arrears Report
            </CardTitle>
            <CardDescription>List of overdue tenants and balances</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Download className="size-4" />
              Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Occupancy Report
            </CardTitle>
            <CardDescription>Vacancy and occupancy statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Download className="size-4" />
              Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Tenant List
            </CardTitle>
            <CardDescription>Complete tenant information export</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Download className="size-4" />
              Download Excel
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Payment History
            </CardTitle>
            <CardDescription>Full payment transaction records</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Download className="size-4" />
              Download Excel
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Maintenance Report
            </CardTitle>
            <CardDescription>Maintenance requests and costs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Download className="size-4" />
              Download PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue comparison over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Expected" strokeWidth={2} />
                <Line type="monotone" dataKey="collected" stroke="#10b981" name="Collected" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy Trend</CardTitle>
            <CardDescription>Property occupancy rate over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#8b5cf6" name="Occupancy %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Property Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Property Performance</CardTitle>
          <CardDescription>Revenue and occupancy comparison by property</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={propertyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
              <Bar yAxisId="right" dataKey="occupancy" fill="#10b981" name="Occupancy (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
