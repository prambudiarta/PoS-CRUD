export interface Item {
  id?: string; // Optional, used if items are identifiable (e.g., by a Firestore document ID)
  name: string; // Name of the item
  price: number; // Price of the item
  category: string; // Category of the item (e.g., 'Drinks', 'Snacks')
  imageUrl?: string; // URL of the item's image, optional
  quantity?: number;
  totalPrice?: number;
}

export interface Categories {
  id?: string;
  category: string;
}

enum OrderStatus {
  Pending = 'pending',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export interface Order {
  orderId: string;
  customerId?: string;
  deviceId: string; // Identifier for the Android box in each room
  roomRate: number; // Hourly rate for the room
  startTime: Date; // When the room was occupied
  endTime?: Date; // When the room was vacated, optional until the session ends
  durationHours?: number; // Calculated based on startTime and endTime
  status: OrderStatus;
  itemsTotalPrice: number; // Total price for all the items ordered
  roomTotalPrice?: number; // Calculated based on roomRate and durationHours
  grandTotalPrice?: number;
  items: Item[]; // Array of items in the order
}

export interface Room {
  id: string;
  price: number;
  description: string;
  isAvailable: boolean;
}

export interface Printer {
  id: string;
  description: string;
}

export interface Lapangan {
  id?: string;
  nama: string;
  deskripsi: string;
  olahraga: Record<string, number>;
}

export interface Booking {
  id?: string;
  status?: string;
  olahraga: string;
  harga: number;
  code: string;
  email: string;
  endTime: Date;
  lapangan: string;
  phoneNumber: string;
  startTime: Date;
}

export interface User {
  id?: string;
  email: string;
  role: string;
}
