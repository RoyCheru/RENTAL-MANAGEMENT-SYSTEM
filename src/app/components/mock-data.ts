// Mock data for RentFlow Manager

export interface Property {
  id: string;
  name: string;
  location: string;
  units: number;
  occupiedUnits: number;
  totalRent: number;
  type: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  rent: number;
  status: "Occupied" | "Vacant";
  tenantId?: string;
  balance: number;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitId: string;
  unitNumber: string;
  propertyName: string;
  status: "Active" | "Overdue" | "Moved Out";
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  balance: number;
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  date: string;
  method: "Cash" | "Bank Transfer" | "Mobile Money" | "Check";
  type: "Rent" | "Deposit" | "Late Fee";
  status: "Completed" | "Pending" | "Failed";
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  unitNumber: string;
  propertyName: string;
  issue: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  completedAt?: string;
}

export interface Notification {
  id: string;
  type: "Rent Due" | "Overdue" | "Lease Expiry" | "Maintenance";
  message: string;
  date: string;
  read: boolean;
  tenantId?: string;
}

export const mockProperties: Property[] = [
  {
    id: "1",
    name: "Sunset Apartments",
    location: "123 Main St, Downtown",
    units: 12,
    occupiedUnits: 10,
    totalRent: 18000,
    type: "Apartment",
  },
  {
    id: "2",
    name: "Green Valley Complex",
    location: "456 Oak Ave, Westside",
    units: 8,
    occupiedUnits: 8,
    totalRent: 16000,
    type: "Apartment",
  },
  {
    id: "3",
    name: "Riverside Studios",
    location: "789 River Rd, Eastside",
    units: 15,
    occupiedUnits: 12,
    totalRent: 21000,
    type: "Studio",
  },
  {
    id: "4",
    name: "Palm Heights",
    location: "321 Palm Dr, Uptown",
    units: 6,
    occupiedUnits: 5,
    totalRent: 15000,
    type: "Townhouse",
  },
];

export const mockUnits: Unit[] = [
  { id: "u1", propertyId: "1", propertyName: "Sunset Apartments", unitNumber: "A-101", rent: 1500, status: "Occupied", tenantId: "t1", balance: 0 },
  { id: "u2", propertyId: "1", propertyName: "Sunset Apartments", unitNumber: "A-102", rent: 1500, status: "Occupied", tenantId: "t2", balance: 1500 },
  { id: "u3", propertyId: "1", propertyName: "Sunset Apartments", unitNumber: "A-103", rent: 1500, status: "Vacant", balance: 0 },
  { id: "u4", propertyId: "1", propertyName: "Sunset Apartments", unitNumber: "A-104", rent: 1500, status: "Occupied", tenantId: "t3", balance: 3000 },
  { id: "u5", propertyId: "2", propertyName: "Green Valley Complex", unitNumber: "B-201", rent: 2000, status: "Occupied", tenantId: "t4", balance: 0 },
  { id: "u6", propertyId: "2", propertyName: "Green Valley Complex", unitNumber: "B-202", rent: 2000, status: "Occupied", tenantId: "t5", balance: 0 },
  { id: "u7", propertyId: "3", propertyName: "Riverside Studios", unitNumber: "C-301", rent: 1400, status: "Occupied", tenantId: "t6", balance: 1400 },
  { id: "u8", propertyId: "3", propertyName: "Riverside Studios", unitNumber: "C-302", rent: 1400, status: "Vacant", balance: 0 },
  { id: "u9", propertyId: "4", propertyName: "Palm Heights", unitNumber: "D-401", rent: 2500, status: "Occupied", tenantId: "t7", balance: 0 },
  { id: "u10", propertyId: "4", propertyName: "Palm Heights", unitNumber: "D-402", rent: 2500, status: "Occupied", tenantId: "t8", balance: 2500 },
];

export const mockTenants: Tenant[] = [
  {
    id: "t1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    unitId: "u1",
    unitNumber: "A-101",
    propertyName: "Sunset Apartments",
    status: "Active",
    leaseStart: "2025-01-01",
    leaseEnd: "2026-01-01",
    rentAmount: 1500,
    balance: 0,
  },
  {
    id: "t2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 234-5678",
    unitId: "u2",
    unitNumber: "A-102",
    propertyName: "Sunset Apartments",
    status: "Overdue",
    leaseStart: "2024-06-01",
    leaseEnd: "2026-06-01",
    rentAmount: 1500,
    balance: 1500,
  },
  {
    id: "t3",
    name: "Michael Brown",
    email: "m.brown@email.com",
    phone: "+1 (555) 345-6789",
    unitId: "u4",
    unitNumber: "A-104",
    propertyName: "Sunset Apartments",
    status: "Overdue",
    leaseStart: "2024-03-15",
    leaseEnd: "2026-03-15",
    rentAmount: 1500,
    balance: 3000,
  },
  {
    id: "t4",
    name: "Emily Davis",
    email: "emily.d@email.com",
    phone: "+1 (555) 456-7890",
    unitId: "u5",
    unitNumber: "B-201",
    propertyName: "Green Valley Complex",
    status: "Active",
    leaseStart: "2024-12-01",
    leaseEnd: "2026-12-01",
    rentAmount: 2000,
    balance: 0,
  },
  {
    id: "t5",
    name: "David Wilson",
    email: "david.w@email.com",
    phone: "+1 (555) 567-8901",
    unitId: "u6",
    unitNumber: "B-202",
    propertyName: "Green Valley Complex",
    status: "Active",
    leaseStart: "2025-02-01",
    leaseEnd: "2026-02-01",
    rentAmount: 2000,
    balance: 0,
  },
  {
    id: "t6",
    name: "Lisa Anderson",
    email: "lisa.a@email.com",
    phone: "+1 (555) 678-9012",
    unitId: "u7",
    unitNumber: "C-301",
    propertyName: "Riverside Studios",
    status: "Overdue",
    leaseStart: "2024-09-01",
    leaseEnd: "2025-09-01",
    rentAmount: 1400,
    balance: 1400,
  },
  {
    id: "t7",
    name: "Robert Martinez",
    email: "robert.m@email.com",
    phone: "+1 (555) 789-0123",
    unitId: "u9",
    unitNumber: "D-401",
    propertyName: "Palm Heights",
    status: "Active",
    leaseStart: "2024-11-01",
    leaseEnd: "2026-11-01",
    rentAmount: 2500,
    balance: 0,
  },
  {
    id: "t8",
    name: "Jennifer Taylor",
    email: "jen.t@email.com",
    phone: "+1 (555) 890-1234",
    unitId: "u10",
    unitNumber: "D-402",
    propertyName: "Palm Heights",
    status: "Overdue",
    leaseStart: "2024-08-01",
    leaseEnd: "2026-08-01",
    rentAmount: 2500,
    balance: 2500,
  },
];

export const mockPayments: Payment[] = [
  {
    id: "p1",
    tenantId: "t1",
    tenantName: "John Smith",
    amount: 1500,
    date: "2026-02-01",
    method: "Bank Transfer",
    type: "Rent",
    status: "Completed",
  },
  {
    id: "p2",
    tenantId: "t4",
    tenantName: "Emily Davis",
    amount: 2000,
    date: "2026-02-01",
    method: "Mobile Money",
    type: "Rent",
    status: "Completed",
  },
  {
    id: "p3",
    tenantId: "t5",
    tenantName: "David Wilson",
    amount: 2000,
    date: "2026-02-02",
    method: "Cash",
    type: "Rent",
    status: "Completed",
  },
  {
    id: "p4",
    tenantId: "t7",
    tenantName: "Robert Martinez",
    amount: 2500,
    date: "2026-02-03",
    method: "Bank Transfer",
    type: "Rent",
    status: "Completed",
  },
  {
    id: "p5",
    tenantId: "t1",
    tenantName: "John Smith",
    amount: 1500,
    date: "2026-01-01",
    method: "Bank Transfer",
    type: "Rent",
    status: "Completed",
  },
  {
    id: "p6",
    tenantId: "t2",
    tenantName: "Sarah Johnson",
    amount: 1500,
    date: "2026-01-01",
    method: "Cash",
    type: "Rent",
    status: "Completed",
  },
  {
    id: "p7",
    tenantId: "t3",
    tenantName: "Michael Brown",
    amount: 750,
    date: "2025-12-15",
    method: "Mobile Money",
    type: "Rent",
    status: "Completed",
  },
];

export const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: "m1",
    tenantId: "t2",
    tenantName: "Sarah Johnson",
    unitNumber: "A-102",
    propertyName: "Sunset Apartments",
    issue: "Leaking Faucet",
    description: "Kitchen faucet is leaking continuously. Water waste is significant.",
    status: "In Progress",
    priority: "High",
    createdAt: "2026-02-07",
  },
  {
    id: "m2",
    tenantId: "t6",
    tenantName: "Lisa Anderson",
    unitNumber: "C-301",
    propertyName: "Riverside Studios",
    issue: "AC Not Working",
    description: "Air conditioning unit not cooling properly.",
    status: "Pending",
    priority: "High",
    createdAt: "2026-02-08",
  },
  {
    id: "m3",
    tenantId: "t1",
    tenantName: "John Smith",
    unitNumber: "A-101",
    propertyName: "Sunset Apartments",
    issue: "Light Bulb Replacement",
    description: "Hallway light bulb needs replacement.",
    status: "Completed",
    priority: "Low",
    createdAt: "2026-02-05",
    completedAt: "2026-02-06",
  },
  {
    id: "m4",
    tenantId: "t4",
    tenantName: "Emily Davis",
    unitNumber: "B-201",
    propertyName: "Green Valley Complex",
    issue: "Door Lock Issue",
    description: "Front door lock is stuck and difficult to open.",
    status: "Pending",
    priority: "Medium",
    createdAt: "2026-02-09",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "Overdue",
    message: "Michael Brown has an overdue payment of $3,000",
    date: "2026-02-09",
    read: false,
    tenantId: "t3",
  },
  {
    id: "n2",
    type: "Maintenance",
    message: "New maintenance request from Sarah Johnson - Leaking Faucet",
    date: "2026-02-07",
    read: false,
    tenantId: "t2",
  },
  {
    id: "n3",
    type: "Rent Due",
    message: "Rent due reminder: 5 tenants have rent due in 3 days",
    date: "2026-02-06",
    read: true,
  },
  {
    id: "n4",
    type: "Lease Expiry",
    message: "Lisa Anderson's lease expiring in 7 months",
    date: "2026-02-05",
    read: true,
    tenantId: "t6",
  },
];

export const monthlyRevenueData = [
  { month: "Aug", revenue: 42000, collected: 38000 },
  { month: "Sep", revenue: 45000, collected: 43000 },
  { month: "Oct", revenue: 48000, collected: 46000 },
  { month: "Nov", revenue: 50000, collected: 48000 },
  { month: "Dec", revenue: 52000, collected: 50000 },
  { month: "Jan", revenue: 55000, collected: 52000 },
  { month: "Feb", revenue: 70000, collected: 62000 },
];

export const occupancyData = [
  { name: "Occupied", value: 35, color: "#10b981" },
  { name: "Vacant", value: 6, color: "#94a3b8" },
];

export const paymentMethodData = [
  { name: "Bank Transfer", value: 45, color: "#3b82f6" },
  { name: "Mobile Money", value: 30, color: "#8b5cf6" },
  { name: "Cash", value: 20, color: "#10b981" },
  { name: "Check", value: 5, color: "#f59e0b" },
];
