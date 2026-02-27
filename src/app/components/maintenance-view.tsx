import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Search, Wrench, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { mockMaintenanceRequests, type MaintenanceRequest } from "./mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function MaintenanceView() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(mockMaintenanceRequests);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = requests.filter(request =>
    request.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = requests.filter(r => r.status === "Pending").length;
  const inProgressCount = requests.filter(r => r.status === "In Progress").length;
  const completedCount = requests.filter(r => r.status === "Completed").length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="size-4" />;
      case "In Progress":
        return <Wrench className="size-4" />;
      case "Completed":
        return <CheckCircle className="size-4" />;
      case "Cancelled":
        return <XCircle className="size-4" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "secondary";
      case "In Progress":
        return "default";
      case "Completed":
        return "outline";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "default";
      case "Low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleStatusChange = (id: string, newStatus: MaintenanceRequest["status"]) => {
    setRequests(requests.map(req =>
      req.id === id
        ? { ...req, status: newStatus, completedAt: newStatus === "Completed" ? new Date().toISOString().split('T')[0] : req.completedAt }
        : req
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Maintenance</h1>
        <p className="text-muted-foreground">Manage maintenance requests and issues</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
            <Clock className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
            <Wrench className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
            <CheckCircle className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{completedCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search maintenance requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressCount})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      request.priority === "High" ? "bg-red-100 dark:bg-red-900/20" :
                      request.priority === "Medium" ? "bg-amber-100 dark:bg-amber-900/20" :
                      "bg-blue-100 dark:bg-blue-900/20"
                    }`}>
                      <Wrench className={`size-5 ${
                        request.priority === "High" ? "text-red-600 dark:text-red-400" :
                        request.priority === "Medium" ? "text-amber-600 dark:text-amber-400" :
                        "text-blue-600 dark:text-blue-400"
                      }`} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg">{request.issue}</h3>
                          <p className="text-sm text-muted-foreground">{request.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>{request.tenantName}</span>
                        <span>•</span>
                        <span>{request.unitNumber}, {request.propertyName}</span>
                        <span>•</span>
                        <span>Reported on {request.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityBadgeVariant(request.priority)}>
                          {request.priority} Priority
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(request.status)} className="gap-1">
                          {getStatusIcon(request.status)}
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {request.status === "Pending" && (
                      <Button size="sm" onClick={() => handleStatusChange(request.id, "In Progress")}>
                        Start Work
                      </Button>
                    )}
                    {request.status === "In Progress" && (
                      <Button size="sm" onClick={() => handleStatusChange(request.id, "Completed")}>
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {filteredRequests.filter(r => r.status === "Pending").map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      request.priority === "High" ? "bg-red-100 dark:bg-red-900/20" :
                      request.priority === "Medium" ? "bg-amber-100 dark:bg-amber-900/20" :
                      "bg-blue-100 dark:bg-blue-900/20"
                    }`}>
                      <Wrench className={`size-5 ${
                        request.priority === "High" ? "text-red-600 dark:text-red-400" :
                        request.priority === "Medium" ? "text-amber-600 dark:text-amber-400" :
                        "text-blue-600 dark:text-blue-400"
                      }`} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="text-lg">{request.issue}</h3>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>{request.tenantName}</span>
                        <span>•</span>
                        <span>{request.unitNumber}, {request.propertyName}</span>
                        <span>•</span>
                        <span>Reported on {request.createdAt}</span>
                      </div>
                      <Badge variant={getPriorityBadgeVariant(request.priority)}>
                        {request.priority} Priority
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleStatusChange(request.id, "In Progress")}>
                    Start Work
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4 mt-4">
          {filteredRequests.filter(r => r.status === "In Progress").map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <Wrench className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="text-lg">{request.issue}</h3>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>{request.tenantName}</span>
                        <span>•</span>
                        <span>{request.unitNumber}, {request.propertyName}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleStatusChange(request.id, "Completed")}>
                    Mark Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-4">
          {filteredRequests.filter(r => r.status === "Completed").map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="text-lg">{request.issue}</h3>
                      <p className="text-sm text-muted-foreground">{request.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{request.tenantName}</span>
                      <span>•</span>
                      <span>{request.unitNumber}, {request.propertyName}</span>
                      <span>•</span>
                      <span>Completed on {request.completedAt}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No maintenance requests found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
