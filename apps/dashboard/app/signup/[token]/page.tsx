import { findPendingSignupInvite } from "@/app/lib/signup-invites";
import SignupForm from "../signup-form";
import { SignupClosed, SignupShell } from "../signup-shell";

export const metadata = {
  title: "Create your gym workspace | Gecco",
  description: "Set up your Gecco gym management workspace.",
  // The token is in the URL, so keep it out of referrers sent from this page.
  referrer: "no-referrer",
};

export default async function SignupInvitePage({ params }: PageProps<"/signup/[token]">) {
  const { token } = await params;
  const invite = await findPendingSignupInvite(token);

  return (
    <SignupShell>
      {invite ? (
        <SignupForm token={token} defaultGymName={invite.gymName ?? ""} lockedEmail={invite.email} />
      ) : (
        <SignupClosed
          title="This link no longer works"
          copy="Signup links work once and expire after a while. Ask the Gecco team to send you a fresh one."
        />
      )}
    </SignupShell>
  );
}
