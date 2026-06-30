import type { PropertyCategory } from "@/types/api";

export type AppCategory = {
  key: string;
  label: string;
  icon: string;
  category: PropertyCategory;
  query?: string;
};

export const categories: AppCategory[] = [
  { key: "pg", label: "PG", icon: "business", category: "PG" },
  { key: "girls-pg", label: "Girls PG", icon: "heart", category: "PG", query: "girls" },
  { key: "boys-pg", label: "Boys PG", icon: "person", category: "PG", query: "boys" },
  { key: "room", label: "Rooms", icon: "key", category: "ROOM" },
  { key: "flat", label: "Flats", icon: "home", category: "FLAT" },
  { key: "homestay", label: "Homestay", icon: "bed", category: "HOMESTAY" },
  { key: "hostel", label: "Hostel", icon: "people", category: "all", query: "hostel" },
  { key: "all", label: "See all", icon: "grid", category: "all" }
];

export const defaultLocalities = ["Beltola", "Ganeshguri", "Six Mile", "GS Road", "Panjabari", "Kahilipara"];
