import { createHash, randomBytes } from "node:crypto";

export const RESET_LIFETIME_MINUTES = 30;
/** Minimum gap between reset emails for one account, to stop inbox flooding. */
export const RESET_REQUEST_COOLDOWN_SECONDS = 60;

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

export function createResetToken() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashResetToken(token),
    expiresAt: new Date(Date.now() + RESET_LIFETIME_MINUTES * 60 * 1000),
  };
}

/** Uses APP_URL when the dashboard runs behind a proxy whose host differs from the public one. */
export function resetUrl(request: Request, token: string) {
  return new URL(`/reset-password/${token}`, process.env.APP_URL || request.url).toString();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

export function resetEmail(fullName: string, url: string) {
  const firstName = fullName.trim().split(/\s+/)[0] || fullName;

  return {
    subject: "Reset your Gecco password",
    text: [
      `Hi ${firstName},`,
      "",
      "We received a request to reset the password for your Gecco account.",
      `Open this link within ${RESET_LIFETIME_MINUTES} minutes to choose a new one:`,
      url,
      "",
      "If you did not ask for this, you can ignore this email. Your password will not change.",
    ].join("\n"),
    html: `
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>We received a request to reset the password for your Gecco account.</p>
      <p><a href="${escapeHtml(url)}" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#6347dd;color:#fff;text-decoration:none;font-weight:600">Choose a new password</a></p>
      <p>This link expires in ${RESET_LIFETIME_MINUTES} minutes. If you did not ask for this, you can ignore this email. Your password will not change.</p>
    `,
  };
}
