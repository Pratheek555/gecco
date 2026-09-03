import { NextResponse } from "next/server";
import { getSession } from "./session";
import { hasPermission, type GymRole, type Permission } from "./permissions";

export async function requirePermission(permission: Permission) {
  const session = await getSession();

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      ),
    };
  }

  const role = session.activeGym.role as GymRole;

  if (!hasPermission(role, permission)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "You do not have permission to perform this action." },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    session,
    role,
  };
}
