import type { MetadataRoute } from "next";

const baseUrl = "https://www.apnarooms.com";

const routes = [
  "",
  "/guwahati",
  "/guwahati-pg",
  "/best-girls-pg-near-physics-wallah-guwahati",
  "/boys-pg-near-physics-wallah-guwahati",
  "/rent-rooms-in-guwahati",
  "/affordable-rooms-for-rent-in-guwahati",
  "/homestay-in-guwahati",
  "/properties",
  "/pg",
  "/girls-pg",
  "/boys-pg",
  "/rooms",
  "/flats",
  "/homestay",
  "/hostel",
  "/about"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route ? "weekly" : "daily",
    priority: route ? 0.8 : 1
  }));
}
