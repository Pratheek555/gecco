import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";
import { resolveAudience } from "../server";
import { isCampaignSegment, MAX_RECIPIENTS, parseSegmentParams } from "../shared";

/** Who a segment matches right now, so the builder can show counts and a sample message. */
export async function POST(request: Request) {
  const auth = await requirePermission("campaigns:send", { fullMemberScope: true });
  if (!auth.ok) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const body = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  if (!isCampaignSegment(body.segment)) {
    return NextResponse.json({ error: "Select an audience." }, { status: 400 });
  }
  const params = parseSegmentParams(body.segment, body.params);
  if (!params.ok) return NextResponse.json({ error: params.error }, { status: 400 });

  const audience = await resolveAudience(auth.session.activeGym, body.segment, params.data);
  return NextResponse.json({
    count: audience.recipients.length,
    missingPhone: audience.missingPhone,
    optedOut: audience.optedOut,
    maxRecipients: MAX_RECIPIENTS,
    sample: audience.recipients.slice(0, 8).map(({ fullName, variables }) => ({ fullName, variables })),
  });
}
