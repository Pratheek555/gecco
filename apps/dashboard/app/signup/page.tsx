import { SignupClosed, SignupShell } from "./signup-shell";

export const metadata = {
  title: "Create your gym workspace | Gecco",
  description: "Set up your Gecco gym management workspace.",
};

export default function SignupPage() {
  return (
    <SignupShell>
      <SignupClosed
        title="Gecco is invite-only"
        copy="We set up every gym with you personally. Reach out and we'll send you a private link to create your workspace."
      />
    </SignupShell>
  );
}
