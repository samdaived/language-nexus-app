import { User, Booking, Language } from "@/types";

export const LANGUAGES: Language[] = [
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ar", name: "Arabic" },
  { code: "zh", name: "Mandarin" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "it", name: "Italian" },
];

export const MOCK_USERS: User[] = [
  { id: "admin-1", name: "Sarah Mitchell", email: "sarah@translathub.com", role: "admin", phone: "+1 555-0100" },
  { id: "trans-1", name: "Carlos Rivera", email: "carlos@translathub.com", role: "translator", languages: ["Spanish", "Portuguese", "French"], phone: "+1 555-0201" },
  { id: "trans-2", name: "Yuki Tanaka", email: "yuki@translathub.com", role: "translator", languages: ["Japanese", "Korean", "Mandarin"], phone: "+1 555-0202" },
  { id: "trans-3", name: "Amir Hassan", email: "amir@translathub.com", role: "translator", languages: ["Arabic", "French", "German"], phone: "+1 555-0203" },
  { id: "cust-1", name: "Emily Watson", email: "emily@acmecorp.com", role: "customer", phone: "+1 555-0301" },
  { id: "cust-2", name: "James Chen", email: "james@techstart.io", role: "customer", phone: "+1 555-0302" },
  { id: "cust-3", name: "Maria Lopez", email: "maria@globalfirm.com", role: "customer", phone: "+1 555-0303" },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

export const MOCK_BOOKINGS: Booking[] = [
  { id: "b1", customerId: "cust-1", customerName: "Emily Watson", translatorId: "trans-1", translatorName: "Carlos Rivera", language: "Spanish", date: fmt(addDays(today, -10)), startTime: "09:00", endTime: "10:30", status: "completed", duration: 90, notes: "Legal document translation" },
  { id: "b2", customerId: "cust-2", customerName: "James Chen", translatorId: "trans-2", translatorName: "Yuki Tanaka", language: "Japanese", date: fmt(addDays(today, -7)), startTime: "14:00", endTime: "15:00", status: "completed", duration: 60, notes: "Business meeting interpretation" },
  { id: "b3", customerId: "cust-1", customerName: "Emily Watson", translatorId: "trans-3", translatorName: "Amir Hassan", language: "Arabic", date: fmt(addDays(today, -3)), startTime: "11:00", endTime: "12:00", status: "completed", duration: 60 },
  { id: "b4", customerId: "cust-3", customerName: "Maria Lopez", translatorId: "trans-1", translatorName: "Carlos Rivera", language: "Portuguese", date: fmt(addDays(today, -1)), startTime: "10:00", endTime: "11:30", status: "completed", duration: 90, notes: "Medical consultation" },
  { id: "b5", customerId: "cust-2", customerName: "James Chen", translatorId: "trans-2", translatorName: "Yuki Tanaka", language: "Korean", date: fmt(today), startTime: "09:00", endTime: "10:00", status: "upcoming", duration: 60, notes: "Tech conference" },
  { id: "b6", customerId: "cust-1", customerName: "Emily Watson", translatorId: "trans-1", translatorName: "Carlos Rivera", language: "French", date: fmt(addDays(today, 2)), startTime: "13:00", endTime: "14:30", status: "upcoming", duration: 90 },
  { id: "b7", customerId: "cust-3", customerName: "Maria Lopez", translatorId: "trans-3", translatorName: "Amir Hassan", language: "German", date: fmt(addDays(today, 3)), startTime: "15:00", endTime: "16:00", status: "upcoming", duration: 60 },
  { id: "b8", customerId: "cust-2", customerName: "James Chen", translatorId: "trans-1", translatorName: "Carlos Rivera", language: "Spanish", date: fmt(addDays(today, 5)), startTime: "10:00", endTime: "11:00", status: "upcoming", duration: 60, notes: "Contract review" },
  { id: "b9", customerId: "cust-1", customerName: "Emily Watson", translatorId: "trans-2", translatorName: "Yuki Tanaka", language: "Mandarin", date: fmt(addDays(today, 7)), startTime: "09:00", endTime: "10:30", status: "upcoming", duration: 90 },
  { id: "b10", customerId: "cust-3", customerName: "Maria Lopez", translatorId: "trans-1", translatorName: "Carlos Rivera", language: "Spanish", date: fmt(addDays(today, -15)), startTime: "14:00", endTime: "15:00", status: "cancelled", duration: 60 },
];
