
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'quanly',
  WORKER = 'congnhan',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name?: string;
  email?: string; // Added email
}

export interface AuthenticatedUser extends User {
  token: string;
}

export type Language = 'vi' | 'ru';
export type Theme = 'light' | 'dark';
export type Currency = 'VND' | 'RUB';

export interface ExchangeRate {
  VND_TO_RUB: number;
}

export interface NavItem {
  path: string;
  labelKey: string; // Key for localization
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  roles: UserRole[];
  children?: NavItem[];
}

export interface Product {
  id: string;
  productCode: string;
  description?: string;
  workerPrice: number;
  customerPrice?: number | null;
  fabricType?: string;
  imageUrl?: string;
}

export type TransactionType = 'payment' | 'deposit' | 'shipment'; // Updated as per request

export interface Transaction {
  id: string;
  date: string; // ISO string
  type: TransactionType;
  description: string;
  amount: number; // For payment/deposit amount, or value of goods for shipment
  paymentMethod?: 'cash' | 'card'; // For payment/deposit
  depositDeducted?: number; // For shipment, if deposit is used
  depositChange?: number; // For deposit transaction, the amount of deposit added/returned
  debtBefore: number;
  debtAfter: number;
  // Fields for specific transaction types
  productCode?: string; // For 'deposit' (planned product) and 'shipment'
  shipmentDate?: string; // For 'deposit' (planned shipment date)
  customerPriceForShipment?: number; // For 'shipment' (actual price for this shipment)
}

export interface Customer {
  id: string;
  building: string; // здание
  shopNumber: string; // точка
  name: string; // derived from shopNumber or a separate field if available
  totalDebt: number;
  debtCurrency?: Currency; // Assuming debt is in RUB from example
  remainingDeposit?: number;
  notes?: string;
  phone?: string;
  transactions?: Transaction[];
}


export interface WorkerGroupMember {
  id: string; // Corresponds to User ID if the worker is a user
  name: string;
}

export interface WorkerGroup {
  id: string;
  name: string; // e.g., "Cạ Hạnh"
  members: WorkerGroupMember[];
  totalProductsMade?: number; // For display
  totalSalary?: number; // For display
}

// For Worker Group Detail Modal - Summarized contribution for a product by a worker
export interface WorkerIndividualProductSummary {
    id: string; // Unique ID: workerId + productCode
    workerId: string;
    workerName: string;
    productCode: string;
    productDescription?: string;
    totalQuantityByWorker: number; // Total quantity for THIS product by THIS worker
    totalSalaryForWorker: number; // Total salary for THIS product by THIS worker
}


// Represents a product made by a group, potentially with specific members active
export interface GroupProductionRecord {
    id: string; // record id
    date: string;
    productCode: string;
    productDescription?: string;
    quantity: number; // Total quantity by the group for this product on this date
    workerPrice: number; // Price per unit for worker
    totalSalary: number; // quantity * workerPrice
    activeMemberIds?: string[]; // Optional: IDs of members who worked on this specific record
}


export interface Premises {
  id:string;
  location: string;
  rentCost: number;
  area: number; // m2
  electricityWaterCost: number;
  livingCost: number;
  workerSuppliesCost: number;
}

export interface ProductionPlan {
  id: string;
  startDate: string;
  endDate: string;
  productCode: string;
  productName: string; // Or link to Product type
  customer: string; // Customer ID
  quantity: number;
  notes?: string;
  planner: string; // User ID or name
  status: 'pending' | 'assigned' | 'completed' | 'on_hold';
  priority: 'high' | 'medium' | 'low';
}

export interface Supplier {
  id: string;
  name: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  suppliesType: string; // e.g., 'fabric', 'accessories', 'general'
  totalOrderValue?: number;
  notes?: string;
}

export interface Accessory {
  id: string;
  entryDate: string;
  accessoryCode: string;
  name: string;
  productCodeUsed?: string; // Product it's used for
  supplierId: string;
  quantity: number;
  unitPrice: number;
  totalCost?: number; // quantity * unitPrice
  notes?: string;
}

export interface Fabric {
  id: string;
  entryDate: string;
  fabricType: string; // Name or code of the fabric
  color?: string;
  productCodeUsed?: string;
  supplierId: string;
  quantity: number; // e.g., meters or kg
  unitPrice: number; // Price per unit (meter/kg)
  totalCost?: number; // quantity * unitPrice
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  creationDate: string;
  dueDate?: string;
  type: 'purchase' | 'sale' | 'debt_payment' | 'other';
  partyId: string; // Customer or Supplier ID
  partyName: string; // Customer or Supplier Name
  items?: { description: string; quantity: number; unitPrice: number; total: number }[]; // For purchase/sale
  totalAmount: number;
  amountPaid?: number;
  status: 'paid' | 'unpaid' | 'partially_paid' | 'overdue';
  notes?: string;
  relatedTo?: string; // e.g., Accessory ID, Fabric ID for purchase invoices
}

export interface MarketGood {
  id: string;
  shipDate: string;
  productCode: string;
  productDescription?: string;
  customerId: string;
  customerName: string;
  quantityNeeded: number; // Quantity customer ordered / to be shipped
  quantityProduced?: number; // Actual quantity produced by workers for this
  status?: 'sufficient' | 'deficit' | 'pending_production' | 'delivered';
  notes?: string;
}

// For OverallPayrollDetailModal - individual breakdown
// This represents the pre-calculated summary for a member for the month.
export interface MonthlyMemberSummary {
    id: string; // Typically memberId for table key
    memberId: string;
    memberName: string;
    totalProductsByMember: number; // Total products this member contributed to the group's monthly total
    totalSalaryByMember: number; // Total salary this member earned from the group's monthly total
}

// For Worker Payroll - "Overall Payroll" tab data
export interface OverallPayrollRecord {
  id: string; // Can be workerGroupId if unique per month, or a generated ID
  workerGroupId: string;
  workerGroupName: string;
  month: string; // e.g., "07/2024"
  totalProducts: number; // Total products made by the group in this month
  totalSalary: number; // Total salary for the group in this month
  status: 'Paid' | 'Pending' | string; // Status of payroll
  memberSummaries: MonthlyMemberSummary[]; // Pre-calculated monthly summary for each member
}


// New type for "Sản Lượng Mã Sản Phẩm" table
export interface DailyProductProductionByGroups {
    id: string; // e.g., workDate + productCode + customerId
    workDate: string;
    productCode: string;
    productDescription?: string;
    workerPrice: number;
    customerName: string; // Or Customer ID
    customerId?: string; // Storing customer ID for consistency
    productionByGroup: { // Key is WorkerGroupId
        [groupId: string]: number; // quantity made by this group
    };
    totalQuantity: number; // Calculated: sum of productionByGroup values
    totalSalary: number; // Calculated: totalQuantity * workerPrice
    absentees?: string; // Notes on absent workers/groups (e.g., "Cạ Yến nghỉ, Hạnh (Cạ Hạnh) nghỉ")
}