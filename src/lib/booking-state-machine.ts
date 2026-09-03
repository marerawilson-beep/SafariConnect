import { BookingRequestStatus } from "@prisma/client";

const transitions: Readonly<Record<BookingRequestStatus, readonly BookingRequestStatus[]>> = {
  [BookingRequestStatus.pending]: [BookingRequestStatus.accepted, BookingRequestStatus.declined, BookingRequestStatus.cancelled],
  [BookingRequestStatus.accepted]: [],
  [BookingRequestStatus.declined]: [],
  [BookingRequestStatus.cancelled]: [],
};

export class InvalidBookingTransitionError extends Error {
  constructor(from: BookingRequestStatus, to: BookingRequestStatus) {
    super(`Booking request cannot transition from ${from} to ${to}.`);
  }
}

export function assertBookingTransition(from: BookingRequestStatus, to: BookingRequestStatus) {
  if (!transitions[from].includes(to)) throw new InvalidBookingTransitionError(from, to);
}

export { transitions as bookingRequestTransitions };
