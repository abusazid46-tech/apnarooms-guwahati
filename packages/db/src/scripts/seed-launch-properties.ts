import { prisma } from "../prisma.js";

const launchProperties = [
  {
    title: "The Atelier Studio, Zoo Road",
    slug: "the-atelier-studio-zoo-road",
    description:
      "Premium furnished studio near Zoo Road with WiFi, housekeeping support, secure entry, and easy access to cafes, offices, and transport.",
    category: "PG" as const,
    status: "PUBLISHED" as const,
    rentMonthly: 9500,
    depositAmount: 10000,
    tokenAmount: 999,
    locality: "Zoo Road",
    city: "Guwahati",
    address: "Zoo Road, Guwahati, Assam",
    isVerified: true,
    isAvailable: true,
    amenities: ["WiFi", "Housekeeping", "Meals Available", "Power Backup", "CCTV"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    title: "Riverside Homestay, Uzan Bazar",
    slug: "riverside-homestay-uzan-bazar",
    description:
      "Warm homestay-style room close to Uzan Bazar with a calm residential setting, attached bath, shared kitchen access, and verified owner support.",
    category: "HOMESTAY" as const,
    status: "PUBLISHED" as const,
    rentMonthly: 18000,
    depositAmount: 15000,
    tokenAmount: 1500,
    locality: "Uzan Bazar",
    city: "Guwahati",
    address: "Uzan Bazar, Guwahati, Assam",
    isVerified: true,
    isAvailable: true,
    amenities: ["Attached Bath", "Kitchen Access", "WiFi", "Water Purifier", "Owner Verified"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    title: "Executive 1BHK, Six Mile",
    slug: "executive-1bhk-six-mile",
    description:
      "Move-in ready 1BHK for working professionals near Six Mile with modular kitchen, balcony, parking support, and quick road connectivity.",
    category: "FLAT" as const,
    status: "PUBLISHED" as const,
    rentMonthly: 22000,
    depositAmount: 22000,
    tokenAmount: 2000,
    locality: "Six Mile",
    city: "Guwahati",
    address: "Six Mile, Guwahati, Assam",
    isVerified: true,
    isAvailable: true,
    amenities: ["Modular Kitchen", "Balcony", "Parking", "Lift", "Security"],
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    title: "Premium Private Room, Beltola",
    slug: "premium-private-room-beltola",
    description:
      "Budget-friendly private room in Beltola with verified listing details, furnished essentials, WiFi option, and flexible move-in date.",
    category: "ROOM" as const,
    status: "PUBLISHED" as const,
    rentMonthly: 8500,
    depositAmount: 8500,
    tokenAmount: 799,
    locality: "Beltola",
    city: "Guwahati",
    address: "Beltola, Guwahati, Assam",
    isVerified: true,
    isAvailable: true,
    amenities: ["Furnished", "WiFi Available", "Flexible Move In", "Local ID Accepted"],
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

async function upsertLaunchProperty(input: (typeof launchProperties)[number]) {
  const property = await prisma.property.upsert({
    where: { slug: input.slug },
    update: {
      title: input.title,
      description: input.description,
      category: input.category,
      status: input.status,
      rentMonthly: input.rentMonthly,
      depositAmount: input.depositAmount,
      tokenAmount: input.tokenAmount,
      locality: input.locality,
      city: input.city,
      address: input.address,
      isVerified: input.isVerified,
      isAvailable: input.isAvailable,
      amenities: input.amenities
    },
    create: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      category: input.category,
      status: input.status,
      rentMonthly: input.rentMonthly,
      depositAmount: input.depositAmount,
      tokenAmount: input.tokenAmount,
      locality: input.locality,
      city: input.city,
      address: input.address,
      isVerified: input.isVerified,
      isAvailable: input.isAvailable,
      amenities: input.amenities
    }
  });

  await prisma.propertyImage.deleteMany({ where: { propertyId: property.id } });
  await prisma.propertyImage.createMany({
    data: input.images.map((url, index) => ({
      propertyId: property.id,
      url,
      alt: input.title,
      sortOrder: index
    }))
  });

  return property;
}

async function main() {
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: { type: "PERCENT", value: 10, maxDiscount: 500, isActive: true },
    create: { code: "WELCOME10", type: "PERCENT", value: 10, maxDiscount: 500 }
  });

  const properties = [];
  for (const property of launchProperties) {
    properties.push(await upsertLaunchProperty(property));
  }

  console.log(`Seeded ${properties.length} launch properties and WELCOME10 coupon.`);
  console.table(properties.map((property) => ({ title: property.title, slug: property.slug, status: property.status })));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
