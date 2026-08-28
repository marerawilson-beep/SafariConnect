import { Role } from "@prisma/client";
import { auth } from "@/auth";

const roles = {
  traveller: Role.traveller,
  vendor: Role.vendor,
  administrator: Role.administrator,
  superAdministrator: Role.super_administrator,
} as const;

export class AuthenticationError extends Error {
  constructor() { super("You must be signed in to access this resource."); }
}

export class AuthorizationError extends Error {
  constructor() { super("You do not have permission to access this resource."); }
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new AuthenticationError();
  return session.user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new AuthorizationError();
  return user;
}

export const requireTraveller = () => requireRole(roles.traveller);
export const requireVendor = () => requireRole(roles.vendor, roles.administrator, roles.superAdministrator);
export const requireAdministrator = () => requireRole(roles.administrator, roles.superAdministrator);
export const requireSuperAdministrator = () => requireRole(roles.superAdministrator);
