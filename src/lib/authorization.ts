import { Role } from "@prisma/client";
import { auth } from "@/auth";

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

export const requireTraveller = () => requireRole(Role.traveller);
export const requireVendor = () => requireRole(Role.vendor, Role.administrator, Role.super_administrator);
export const requireAdministrator = () => requireRole(Role.administrator, Role.super_administrator);
export const requireSuperAdministrator = () => requireRole(Role.super_administrator);
