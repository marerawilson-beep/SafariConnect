import { ListingType, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const users = [
  { email: "traveller@safariconnect.demo", name: "Demo Traveller", role: Role.traveller },
  { email: "vendor@safariconnect.demo", name: "Demo Vendor", role: Role.vendor },
  { email: "administrator@safariconnect.demo", name: "Demo Administrator", role: Role.administrator },
  { email: "super-admin@safariconnect.demo", name: "Demo Super Administrator", role: Role.super_administrator },
];

async function main() {
  const passwordHash = await bcrypt.hash("SafariConnectDemo123!", 12);

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash },
      create: { ...user, passwordHash },
    });
  }

  const vendor = await prisma.user.findUniqueOrThrow({ where: { email: "vendor@safariconnect.demo" } });
  const listings = [
    { slug: "mara-sunrise-camp", title: "Mara Sunrise Camp", type: ListingType.accommodation, location: "Maasai Mara", description: "An intimate camp near the reserve.", priceFrom: 38500, accommodation: { rooms: 12, guests: 2 } },
    { slug: "amboseli-elephant-trail", title: "Amboseli Elephant Trail", type: ListingType.tour, location: "Amboseli", description: "A three-day guided wildlife journey.", priceFrom: 52000, tour: { durationDays: 3, maxGuests: 8 } },
    { slug: "nairobi-food-stories", title: "Nairobi Food & Stories", type: ListingType.activity, location: "Nairobi", description: "A local food and culture walk.", priceFrom: 6800, activity: { durationMinutes: 240, minAge: 12 } },
    { slug: "diani-tide-table", title: "Diani Tide Table", type: ListingType.restaurant, location: "Diani Beach", description: "Fresh coastal plates by the ocean.", priceFrom: 2500, restaurant: { cuisine: "Kenyan coastal", address: "Diani Beach Road" } },
  ];

  for (const item of listings) {
    const { accommodation, tour, activity, restaurant, ...listing } = item;
    await prisma.listing.upsert({
      where: { slug: listing.slug },
      update: { ...listing, ownerId: vendor.id, isPublished: true },
      create: {
        ...listing,
        ownerId: vendor.id,
        isPublished: true,
        accommodation: accommodation ? { create: accommodation } : undefined,
        tour: tour ? { create: tour } : undefined,
        activity: activity ? { create: activity } : undefined,
        restaurant: restaurant ? { create: restaurant } : undefined,
      },
    });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
