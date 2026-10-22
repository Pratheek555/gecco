import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mark } from "@/components/mark";
import { getAdmin } from "@/lib/auth";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  if (await getAdmin()) redirect("/");

  return (
    <main className="signin">
      <section className="signin-side">
        <div className="brand">
          <Mark size={24} />
          Gecco HQ
        </div>
        <div className="signin-quote">
          <p>Every gym climbs the same ladder. This is where we see who needs a hand.</p>
          <small>Internal console for the Gecco team.</small>
          <div className="signin-ladder" aria-hidden="true">
            <div><i />Link sent</div>
            <div><i />Signed up</div>
            <div><i />Members added</div>
            <div><i />First payment</div>
            <div><i />Team invited</div>
            <div><i />Live this week</div>
          </div>
        </div>
        <span className="stamp">Access is limited to Gecco staff.</span>
      </section>
      <section className="signin-panel">
        <SignInForm />
      </section>
    </main>
  );
}
