import type { PropertyCategory } from "@/types/api";

export type AppCategory = {
  key: string;
  label: string;
  icon: string;
  category: PropertyCategory;
};

export const categories: AppCategory[] = [
  { key: "all", label: "All", icon: "grid", category: "all" },
  { key: "pg", label: "PG", icon: "business", category: "PG" },
  { key: "girls-pg", label: "Girls PG", icon: "heart", category: "GIRLS_PG" },
  { key: "boys-pg", label: "Boys PG", icon: "person", category: "BOYS_PG" },
  { key: "room", label: "Rooms", icon: "key", category: "ROOM" },
  { key: "flat", label: "Flats", icon: "home", category: "FLAT" },
  { key: "homestay", label: "Homestay", icon: "bed", category: "HOMESTAY" },
  { key: "hostel", label: "Hostel", icon: "people", category: "HOSTEL" }
];

export const defaultLocalities = ["Beltola", "Ganeshguri", "Six Mile", "GS Road", "Panjabari", "Kahilipara"];
