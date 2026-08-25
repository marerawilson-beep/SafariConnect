import { PrismaClient, Role, VendorStatus, ListingStatus, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const destinations = ["Nairobi", "Maasai Mara", "Diani Beach", "Mombasa", "Amboseli", "Lake Nakuru", "Naivasha", "Lamu", "Tsavo", "Samburu", "Laikipia", "Mount Kenya"];
const categories = [["Hotels", "accommodation"], ["Lodges", "accommodation"], ["Villas", "accommodation"], ["Safaris", "experiences"], ["Activities", "experiences"], ["Restaurants", "dining"], ["Tours", "experiences"], ["Car Rental", "services"]];
const amenities = ["Wi-Fi", "Pool", "Parking", "Breakfast", "Air conditioning", "Family friendly", "Beachfront"];
const businessTypes = ["Hotel", "Lodge", "Villa", "Safari operator", "Activity provider", "Restaurant", "Tour operator"];
const demoEmail = (kind, index) => `${kind}${index}@safariconnect.demo`;

async function findOrCreate(model, where, data) {
  const existing = await model.findFirst({ where });
  return existing ? model.update({ where: { id: existing.id }, data }) : model.create({ data });
}

async function ensureListingSupport(listing, amenityRows, index) {
  await findOrCreate(prisma.listingImage, { listingId: listing.id, position: 0 }, { listingId: listing.id, url: "https://images.unsplash.com/photo-1516426122078-c23e76319801", position: 0 });
  await findOrCreate(prisma.availability, { listingId: listing.id, startDate: new Date("2026-09-01"), endDate: new Date("2026-12-31") }, { listingId: listing.id, startDate: new Date("2026-09-01"), endDate: new Date("2026-12-31"), available: true });
  for (const amenity of amenityRows.slice(0, 3)) await prisma.listingAmenity.upsert({ where: { listingId_amenityId: { listingId: listing.id, amenityId: amenity.id } }, update: {}, create: { listingId: listing.id, amenityId: amenity.id } });
  if (index > 45) await findOrCreate(prisma.room, { listingId: listing.id, name: "Demo Deluxe Room" }, { listingId: listing.id, name: "Demo Deluxe Room", guests: 2, beds: 1 });
  if (index <= 15) {
    const tour = await prisma.tourPackage.upsert({ where: { listingId: listing.id }, update: { durationDays: 3 }, create: { listingId: listing.id, durationDays: 3 } });
    for (const [day, title, description] of [[1, "Arrival", "Welcome to your demo safari."], [2, "Explore", "Guided wildlife experience."], [3, "Return", "Travel home."]]) await findOrCreate(prisma.tourItinerary, { tourPackageId: tour.id, day }, { tourPackageId: tour.id, day, title, description });
  }
}

async function main() {
  // Additive and idempotent: every operation has a stable SafariConnect demo lookup; nothing is deleted.
  const destinationRows = [];
  for (const name of destinations) destinationRows.push(await prisma.destination.upsert({ where: { slug: slug(name) }, update: {}, create: { name, slug: slug(name), description: `Demo destination: ${name}.` } }));
  const categoryRows = new Map();
  for (const [name, group] of categories) categoryRows.set(slug(name), await prisma.category.upsert({ where: { slug: slug(name) }, update: {}, create: { name, slug: slug(name), group } }));
  const amenityRows = [];
  for (const name of amenities) amenityRows.push(await prisma.amenity.upsert({ where: { name }, update: {}, create: { name } }));

  const admin = await prisma.user.upsert({ where: { email: "admin@safariconnect.demo" }, update: { name: "Demo Administrator", role: Role.ADMIN }, create: { email: "admin@safariconnect.demo", name: "Demo Administrator", role: Role.ADMIN, passwordHash: "DEMO_ONLY_NOT_FOR_PRODUCTION" } });
  await prisma.profile.upsert({ where: { userId: admin.id }, update: { country: "Kenya" }, create: { userId: admin.id, country: "Kenya" } });
  const travellers = [];
  for (let i = 1; i <= 30; i++) {
    const email = demoEmail("traveller", i);
    const user = await prisma.user.upsert({ where: { email }, update: { name: `Demo Traveller ${i}`, role: Role.TRAVELLER }, create: { email, name: `Demo Traveller ${i}`, role: Role.TRAVELLER, passwordHash: "DEMO_ONLY_NOT_FOR_PRODUCTION" } });
    await prisma.profile.upsert({ where: { userId: user.id }, update: { phone: `+254700${String(i).padStart(6, "0")}`, country: "Kenya" }, create: { userId: user.id, phone: `+254700${String(i).padStart(6, "0")}`, country: "Kenya" } });
    travellers.push(user);
  }
  const vendors = [];
  for (let i = 1; i <= 20; i++) {
    const email = demoEmail("vendor", i); const businessName = `Demo Kenya Travel Co. ${i}`;
    const user = await prisma.user.upsert({ where: { email }, update: { name: `Demo Host ${i}`, role: Role.VENDOR }, create: { email, name: `Demo Host ${i}`, role: Role.VENDOR, passwordHash: "DEMO_ONLY_NOT_FOR_PRODUCTION" } });
    await prisma.profile.upsert({ where: { userId: user.id }, update: { country: "Kenya" }, create: { userId: user.id, country: "Kenya" } });
    const vendor = await prisma.vendor.upsert({ where: { userId: user.id }, update: { businessName, businessType: businessTypes[(i - 1) % businessTypes.length], status: VendorStatus.APPROVED, verified: true }, create: { userId: user.id, businessName, businessType: businessTypes[(i - 1) % businessTypes.length], status: VendorStatus.APPROVED, verified: true } });
    await findOrCreate(prisma.vendorVerification, { vendorId: vendor.id, status: VendorStatus.APPROVED, notes: "Development demo vendor." }, { vendorId: vendor.id, status: VendorStatus.APPROVED, notes: "Development demo vendor." });
    vendors.push({ ...vendor, userId: user.id });
  }
  const listings = [];
  for (let i = 1; i <= 50; i++) {
    const categoryKey = i <= 15 ? "safaris" : i <= 30 ? "activities" : i <= 45 ? "restaurants" : ["hotels", "lodges", "villas", "tours", "car-rental"][(i - 46) % 5];
    const type = i <= 15 ? "Safari" : i <= 30 ? "Activity" : i <= 45 ? "Restaurant" : "Stay"; const name = `Demo ${type} Experience ${i}`; const destination = destinationRows[i % destinationRows.length];
    const data = { name, description: `Development demo ${type.toLowerCase()} in ${destination.name}.`, price: 5000 + i * 750, currency: "KES", status: ListingStatus.PUBLISHED, vendorId: vendors[i % vendors.length].id, categoryId: categoryRows.get(categoryKey).id, destinationId: destination.id };
    const listing = await prisma.listing.upsert({ where: { slug: slug(name) }, update: data, create: { slug: slug(name), ...data } });
    await ensureListingSupport(listing, amenityRows, i); listings.push(listing);
  }
  for (let i = 0; i < 5; i++) await prisma.featuredListing.upsert({ where: { listingId: listings[i].id }, update: {}, create: { listingId: listings[i].id } });
  for (let i = 0; i < 10; i++) {
    const reference = `SC-2026-DEMO${String(i + 1).padStart(2, "0")}`;
    const request = await prisma.bookingRequest.upsert({ where: { reference }, update: { listingId: listings[i].id, travellerId: travellers[i].id, status: i < 4 ? BookingStatus.ACCEPTED : BookingStatus.SUBMITTED, startDate: new Date("2026-10-01"), endDate: new Date("2026-10-04"), guests: 2 }, create: { reference, listingId: listings[i].id, travellerId: travellers[i].id, status: i < 4 ? BookingStatus.ACCEPTED : BookingStatus.SUBMITTED, startDate: new Date("2026-10-01"), endDate: new Date("2026-10-04"), guests: 2 } });
    await findOrCreate(prisma.bookingGuest, { bookingRequestId: request.id, name: travellers[i].name }, { bookingRequestId: request.id, name: travellers[i].name });
    await findOrCreate(prisma.notification, { userId: travellers[i].id, type: "BOOKING_REQUEST", body: `Demo request ${reference} created.` }, { userId: travellers[i].id, type: "BOOKING_REQUEST", body: `Demo request ${reference} created.` });
  }
  for (let i = 0; i < 50; i++) await findOrCreate(prisma.review, { listingId: listings[i].id, travellerId: travellers[i % travellers.length].id, body: "Development demo review for local testing." }, { listingId: listings[i].id, travellerId: travellers[i % travellers.length].id, rating: 4 + (i % 2), body: "Development demo review for local testing." });
  for (let i = 0; i < 20; i++) { const marker = `Demo message 1 in conversation ${i + 1}.`; const existing = await prisma.message.findFirst({ where: { body: marker }, select: { conversationId: true } }); const conversation = existing ?? await prisma.conversation.create({ data: {} }); for (let j = 0; j < 5; j++) { const body = `Demo message ${j + 1} in conversation ${i + 1}.`; await findOrCreate(prisma.message, { conversationId: conversation.conversationId ?? conversation.id, body }, { conversationId: conversation.conversationId ?? conversation.id, senderId: j % 2 ? travellers[i % travellers.length].id : vendors[i % vendors.length].userId, body }); } }
  for (let i = 0; i < 10; i++) { const wishlist = await prisma.wishlist.upsert({ where: { userId: travellers[i].id }, update: {}, create: { userId: travellers[i].id } }); await prisma.wishlistItem.upsert({ where: { wishlistId_listingId: { wishlistId: wishlist.id, listingId: listings[i].id } }, update: {}, create: { wishlistId: wishlist.id, listingId: listings[i].id } }); }
  const blogCategory = await prisma.blogCategory.upsert({ where: { name: "Demo Travel Guides" }, update: {}, create: { name: "Demo Travel Guides" } });
  for (let i = 1; i <= 3; i++) await prisma.blogPost.upsert({ where: { slug: `demo-travel-guide-${i}` }, update: { title: `Demo Travel Guide ${i}`, content: "Development demo travel content.", categoryId: blogCategory.id }, create: { title: `Demo Travel Guide ${i}`, slug: `demo-travel-guide-${i}`, content: "Development demo travel content.", categoryId: blogCategory.id } });
  for (let i = 0; i < 3; i++) { await findOrCreate(prisma.report, { reporterId: travellers[i].id, targetType: "LISTING", targetId: listings[i].id, reason: "Development demo report." }, { reporterId: travellers[i].id, targetType: "LISTING", targetId: listings[i].id, reason: "Development demo report." }); await findOrCreate(prisma.savedItinerary, { userId: travellers[i].id, title: `Demo itinerary ${i + 1}` }, { userId: travellers[i].id, title: `Demo itinerary ${i + 1}`, data: { listingIds: [listings[i].id], demo: true } }); const content = `Demo AI greeting ${i + 1}.`; const existing = await prisma.aIMessage.findFirst({ where: { content }, select: { conversationId: true } }); const conversationId = existing?.conversationId ?? (await prisma.aIConversation.create({ data: { userId: travellers[i].id } })).id; await findOrCreate(prisma.aIMessage, { conversationId, content }, { conversationId, role: "assistant", content }); }
  for (let i = 0; i < 5; i++) await findOrCreate(prisma.auditLog, { actorId: admin.id, action: "DEMO_SEED", targetType: "LISTING", targetId: listings[i].id }, { actorId: admin.id, action: "DEMO_SEED", targetType: "LISTING", targetId: listings[i].id, metadata: { demo: true } });
  const demoListings = { slug: { startsWith: "demo-" } };
  const counts = {
    destinations: await prisma.destination.count({ where: { slug: { in: destinations.map(slug) } } }),
    categories: await prisma.category.count({ where: { slug: { in: categories.map(([name]) => slug(name)) } } }),
    vendors: await prisma.vendor.count({ where: { user: { email: { startsWith: "vendor", endsWith: "@safariconnect.demo" } } } }),
    travellers: await prisma.user.count({ where: { email: { startsWith: "traveller", endsWith: "@safariconnect.demo" } } }),
    listings: await prisma.listing.count({ where: demoListings }),
    safaris: await prisma.listing.count({ where: { ...demoListings, category: { slug: "safaris" } } }),
    activities: await prisma.listing.count({ where: { ...demoListings, category: { slug: "activities" } } }),
    restaurants: await prisma.listing.count({ where: { ...demoListings, category: { slug: "restaurants" } } }),
    requests: await prisma.bookingRequest.count({ where: { reference: { startsWith: "SC-2026-DEMO" } } }),
    conversations: await prisma.conversation.count({ where: { messages: { some: { body: { startsWith: "Demo message " } } } } }),
    messages: await prisma.message.count({ where: { body: { startsWith: "Demo message " } } }),
    reviews: await prisma.review.count({ where: { body: "Development demo review for local testing." } }),
  };
  console.log(JSON.stringify(counts));
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
