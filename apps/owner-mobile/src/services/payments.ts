import * as WebBrowser from "expo-web-browser";
import { env } from "@/config/env";
import type { BackendProperty } from "@/types/api";

export async function openWhatsAppBooking(property: BackendProperty) {
  const text = [
    "Hi ApnaRooms, I want to book this property.",
    `Property: ${property.title}`,
    `Locality: ${property.locality}`,
    `Price: INR ${property.rentMonthly.toLocaleString("en-IN")}`,
    `Token: INR ${property.tokenAmount.toLocaleString("en-IN")}`,
    `Link: ${env.webUrl}/properties/${property.id}`
  ].join("\n");

  await WebBrowser.openBrowserAsync(`https://wa.me/${env.whatsappNumber}?text=${encodeURIComponent(text)}`);
}

export async function openPropertyCheckout(property: BackendProperty) {
  await WebBrowser.openBrowserAsync(`${env.webUrl}/?checkout=${property.id}`);
}
