import type { Session } from "next-auth";

function parseEmails(raw: string | undefined) {
  return new Set(
    (raw || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isInternalAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const allowedEmails = parseEmails(process.env.INTERNAL_ADMIN_EMAILS);
  return allowedEmails.has(email.toLowerCase());
}

export function requireInternalAdmin(session: Session | null) {
  return Boolean(session?.user?.email && isInternalAdminEmail(session.user.email));
}

export function isInternalAdminClient(email: string | null | undefined) {
  if (!email) return false;
  const allowedEmails = parseEmails(process.env.NEXT_PUBLIC_INTERNAL_ADMIN_EMAILS);
  return allowedEmails.has(email.toLowerCase());
}
