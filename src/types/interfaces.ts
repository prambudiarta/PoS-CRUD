//DEPRECATED
export interface Item {
  id?: string; // Optional, used if items are identifiable (e.g., by a Firestore document ID)
  name: string; // Name of the item
  price: number; // Price of the item
  category: string; // Category of the item (e.g., 'Drinks', 'Snacks')
  imageUrl?: string; // URL of the item's image, optional
}

//DEPRECATED
export interface Lapangan {
  id?: string;
  nama: string;
  deskripsi: string;
  olahraga: Record<string, number>;
}

//DEPRECATED
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

// Define the basic structure for a sports package
export interface IPackage {
  packageName: string;
  price: number;
  sku: string;
  duration: number;
  details?: string;
}

// Define the structure for a sport, which includes a collection of packages
export interface ISport {
  sportName: string;
  sportDescription: string;
  packages?: IPackage[];
}

// Define the structure for a field, which includes a collection of sports
export interface IField {
  fieldId: string;
  fieldName: string;
  location: string;
  sports?: ISport[];
}
