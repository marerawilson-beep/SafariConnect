"use server";

import { revalidatePath } from "next/cache";
import { requireUser, AuthorizationError } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { listMessagesSchema, sendMessageSchema } from "@/lib/validation/booking";

async function assertThreadParticipant(userId: string, bookingRequestId?: string, listingId?: string) {
  if (bookingRequestId) {
    const request = await prisma.bookingRequest.findUnique({ where: { id: bookingRequestId }, include: { listing: { select: { ownerId: true } } } });
    if (!request) throw new Error("Booking request not found.");
    const participantIds = [request.travellerId, request.listing.ownerId];
    if (!participantIds.includes(userId)) throw new AuthorizationError();
    return participantIds;
  }

  if (!listingId) throw new Error("Message thread not found.");
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } });
  if (!listing) throw new Error("Listing not found.");
  if (userId === listing.ownerId) return [listing.ownerId];
  const existingConversation = await prisma.message.findFirst({
    where: { listingId, OR: [{ senderId: userId }, { recipientId: userId }] },
    select: { id: true },
  });
  if (!existingConversation) throw new AuthorizationError();
  return [listing.ownerId, userId];
}

export async function sendMessage(input: unknown) {
  const sender = await requireUser();
  const data = sendMessageSchema.parse(input);
  const participantIds = await assertThreadParticipant(sender.id, data.bookingRequestId, data.listingId);

  if (data.bookingRequestId && !participantIds.includes(data.recipientId)) throw new AuthorizationError();
  if (data.listingId && data.recipientId !== participantIds[0] && sender.id !== participantIds[0]) throw new AuthorizationError();
  if (data.recipientId === sender.id) throw new Error("Messages must be sent to another participant.");

  const message = await prisma.message.create({
    data: {
      bookingRequest: data.bookingRequestId ? { connect: { id: data.bookingRequestId } } : undefined,
      listing: data.listingId ? { connect: { id: data.listingId } } : undefined,
      sender: { connect: { id: sender.id } },
      recipient: { connect: { id: data.recipientId } },
      content: data.content,
    },
  });
  revalidatePath("/dashboard");
  return message;
}

export async function listMessages(input: unknown) {
  const user = await requireUser();
  const data = listMessagesSchema.parse(input);
  await assertThreadParticipant(user.id, data.bookingRequestId, data.listingId);
  const where = data.bookingRequestId
    ? { bookingRequestId: data.bookingRequestId }
    : { listingId: data.listingId, OR: [{ senderId: user.id }, { recipientId: user.id }] };
  const messages = await prisma.message.findMany({ where, orderBy: { createdAt: "asc" }, include: { sender: { select: { id: true, name: true } }, recipient: { select: { id: true, name: true } } } });
  await prisma.message.updateMany({ where: { ...where, recipientId: user.id, readAt: null }, data: { readAt: new Date() } });
  return messages;
}
