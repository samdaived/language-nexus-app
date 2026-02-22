export type UserRole = "admin" | "translator" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  languages?: string[];
  phone?: string;
  avatar?: string;
}

export type BookingStatus = "upcoming" | "completed" | "cancelled";

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  translatorId: string;
  translatorName: string;
  language: string;
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
  duration: number; // in minutes
}

export interface Language {
  code: string;
  name: string;
}
