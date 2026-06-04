import type { MetadataRoute } from "next";

const baseUrl = "https://www.apnarooms.com";

const routes = [
  "",
  "/guwahati",
  "/guwahati-pg",
  "/rent-rooms-in-guwahati",
  "/affordable-rooms-for-rent-in-guwahati",
  "/homestay-in-guwahati",
  "/properties",
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
