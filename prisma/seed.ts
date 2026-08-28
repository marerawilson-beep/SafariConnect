import { PrismaClient, Role } from "@prisma/client";
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
  const owner = { connect: { id: vendor.id } };

  await prisma.listing.upsert({
    where: { slug: "mara-sunrise-camp" },
    update: { title: "Mara Sunrise Camp", description: "An intimate camp near the reserve.", location: "Maasai Mara", priceFrom: 38500, isPublished: true, owner },
    create: { slug: "mara-sunrise-camp", title: "Mara Sunrise Camp", type: "accommodation", description: "An intimate camp near the reserve.", location: "Maasai Mara", priceFrom: 38500, isPublished: true, owner, accommodation: { create: { rooms: 12, guests: 2 } } },
  });

  await prisma.listing.upsert({
    where: { slug: "amboseli-elephant-trail" },
    update: { title: "Amboseli Elephant Trail", description: "A three-day guided wildlife journey.", location: "Amboseli", priceFrom: 52000, isPublished: true, owner },
    create: { slug: "amboseli-elephant-trail", title: "Amboseli Elephant Trail", type: "tour", description: "A three-day guided wildlife journey.", location: "Amboseli", priceFrom: 52000, isPublished: true, owner, tour: { create: { durationDays: 3, maxGuests: 8 } } },
  });

  await prisma.listing.upsert({
    where: { slug: "nairobi-food-stories" },
    update: { title: "Nairobi Food & Stories", description: "A local food and culture walk.", location: "Nairobi", priceFrom: 6800, isPublished: true, owner },
    create: { slug: "nairobi-food-stories", title: "Nairobi Food & Stories", type: "activity", description: "A local food and culture walk.", location: "Nairobi", priceFrom: 6800, isPublished: true, owner, activity: { create: { durationMinutes: 240, minAge: 12 } } },
  });

  await prisma.listing.upsert({
    where: { slug: "diani-tide-table" },
    update: { title: "Diani Tide Table", description: "Fresh coastal plates by the ocean.", location: "Diani Beach", priceFrom: 2500, isPublished: true, owner },
    create: { slug: "diani-tide-table", title: "Diani Tide Table", type: "restaurant", description: "Fresh coastal plates by the ocean.", location: "Diani Beach", priceFrom: 2500, isPublished: true, owner, restaurant: { create: { cuisine: "Kenyan coastal", address: "Diani Beach Road" } } },
  });
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
