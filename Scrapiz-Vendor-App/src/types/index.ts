export interface User {
  id: string;
  name: string;
  phone: string;
  isOnline: boolean;
}

export interface BookingRequest {
  id: string;
  scrapType: string;
  distance: string;
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMode: string;
  estimatedAmount: number;
  createdAt: Date;
  priority?: 'high' | 'medium' | 'low';
  estimatedTime?: string;
}

export interface ActiveJob extends BookingRequest {
  status: 'on-the-way' | 'arrived' | 'in-progress' | 'completed';
  customerLocation: {
    lat: number;
    lng: number;
  };
}

export interface ScrapItem {
  type: string;
  weight?: number;
  ratePerKg: number;
  color?: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  jobId: string;
  amount: number;
  date: Date;
  status: 'completed' | 'pending';
}

export interface EarningsData {
  totalEarnings: number;
  totalJobs: number;
  transactions: Transaction[];
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: 'auto' | 'truck' | 'van';
  capacity: number;
  isOnline: boolean;
  currentLoad: number;
}

export interface PickupUnit {
  id: string;
  name: string;
  type: string;
  address: string;
}

export interface FutureRequest extends BookingRequest {
  scheduledDate: Date;
  scheduledTime: string;
  isConfirmed: boolean;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  currentRate: number;
  unit: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  type: 'customer' | 'supervisor' | 'partner';
  lastContact: Date;
  avatarUrl?: string;
}