import { AuthShell } from "../../login/auth-shell";
import ResetPasswordForm from "./reset-password-form";

export const metadata = {
  title: "Choose a new password · Gecco",
  // The token is in the URL, so keep it out of referrers sent from this page.
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({ params }: PageProps<"/reset-password/[token]">) {
  const { token } = await params;

  return (
    <AuthShell>
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
