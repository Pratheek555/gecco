import { LockKeyhole } from "lucide-react";
import ManageShell from "../manage-shell";

export default function NoAccessPage() {
  return (
    <ManageShell>
      <div className="panel managed-empty">
        <LockKeyhole size={23} />
        <strong>Nothing has been shared with you yet</strong>
        <span>Your gym owner controls which sections you can see. Ask them to give you access from their Team page.</span>
      </div>
    </ManageShell>
  );
}
