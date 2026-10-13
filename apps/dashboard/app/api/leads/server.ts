import { prisma } from "db/client";
import { phoneKey } from "./shared";

export type LeadDuplicate =
  | { kind: "lead"; id: string; fullName: string; status: string }
  | { kind: "member"; id: string; fullName: string; memberNumber: string };

const noLead = "00000000-0000-0000-0000-000000000000";

/** Leads and members in the gym that share a phone number or email with the given contact. */
export async function findLeadDuplicates(
  gymId: string,
  contact: { phone: string | null; email: string | null },
  excludeLeadId: string = noLead,
): Promise<LeadDuplicate[]> {
  const phone = phoneKey(contact.phone);
  const email = contact.email?.toLowerCase() ?? null;
  if (!phone && !email) return [];

  const [leads, members] = await Promise.all([
    prisma.$queryRaw<{ id: string; full_name: string; status: string }[]>`
      SELECT id, full_name, status::text AS status
      FROM leads
      WHERE gym_id = ${gymId}::uuid
        AND id <> ${excludeLeadId}::uuid
        AND converted_member_id IS NULL
        AND (
          (${phone}::text IS NOT NULL AND right(regexp_replace(coalesce(phone, ''), '\\D', '', 'g'), 10) = ${phone}::text)
          OR (${email}::text IS NOT NULL AND lower(email) = ${email}::text)
        )
      ORDER BY updated_at DESC
      LIMIT 5`,
    prisma.$queryRaw<{ id: string; full_name: string; member_number: string }[]>`
      SELECT DISTINCT m.id, m.full_name, m.member_number
      FROM member_contacts c
      JOIN members m ON m.id = c.member_id
      WHERE m.gym_id = ${gymId}::uuid
        AND (
          (${phone}::text IS NOT NULL AND c.kind IN ('PHONE', 'WHATSAPP')
            AND right(regexp_replace(c.value, '\\D', '', 'g'), 10) = ${phone}::text)
          OR (${email}::text IS NOT NULL AND c.kind = 'EMAIL' AND lower(c.value) = ${email}::text)
        )
      LIMIT 5`,
  ]);

  return [
    ...members.map((member) => ({
      kind: "member" as const,
      id: member.id,
      fullName: member.full_name,
      memberNumber: member.member_number,
    })),
    ...leads.map((lead) => ({
      kind: "lead" as const,
      id: lead.id,
      fullName: lead.full_name,
      status: lead.status,
    })),
  ];
}

/** Active users of the gym who can own leads. */
export function leadTeam(gymId: string) {
  return prisma.gymUser.findMany({
    where: { gymId, isActive: true },
    orderBy: { user: { fullName: "asc" } },
    select: { role: true, user: { select: { id: true, fullName: true } } },
  });
}

export async function isLeadTeamMember(gymId: string, userId: string) {
  const member = await prisma.gymUser.findUnique({
    where: { gymId_userId: { gymId, userId } },
    select: { isActive: true },
  });
  return Boolean(member?.isActive);
}
