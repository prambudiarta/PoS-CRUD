export interface Item {
  id?: string; // Optional, used if items are identifiable (e.g., by a Firestore document ID)
  name: string; // Name of the item
  price: number; // Price of the item
  category: string; // Category of the item (e.g., 'Drinks', 'Snacks')
  imageUrl?: string; // URL of the item's image, optional
}

export interface Lapangan {
  id?: string;
  nama: string;
  deskripsi: string;
  harga: number;
}

export interface Booking {
  id?: string;
  email: string;
  endTime: Date;
  lapangan: string;
  phoneNumber: string;
  startTime: Date;
}
