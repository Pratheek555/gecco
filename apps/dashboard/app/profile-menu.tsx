"use client";

import { Building2, ChevronDown, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCan, useSession } from "./session-provider";

type ProfileMenuProps = {
  name: string | undefined;
  initials: string;
  role: string;
  onNotify: (message: string) => void;
};

export default function ProfileMenu({ name, initials, role }: ProfileMenuProps) {
  const router = useRouter();
  const canManageGym = useCan("gym:manage");
  const { session } = useSession();

  async function signOut() {
    try {
      await fetch("/api/session", { method: "DELETE" });
    } finally {
      router.replace("/login");
    }
  }

  return <DropdownMenu modal={false}>
    <DropdownMenuTrigger asChild>
      <button className="profile" aria-label="Open account menu"><span className="avatar avatar-main">{initials}</span><span className="profile-copy"><strong>{name}</strong><small>{role}</small></span><ChevronDown size={15} /></button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="min-w-52">
      <DropdownMenuGroup>
        {canManageGym && <DropdownMenuItem onSelect={() => router.push("/settings")}><Settings />Settings</DropdownMenuItem>}
        {session?.isPlatformAdmin && <DropdownMenuItem onSelect={() => router.push("/admin/gyms")}><Building2 />Onboard gyms</DropdownMenuItem>}
        <DropdownMenuItem variant="destructive" onSelect={() => void signOut()}><LogOut />Sign out</DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>;
}
