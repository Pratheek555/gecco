"use client";

import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProfileMenuProps = {
  name: string;
  initials: string;
  role: string;
  onNotify: (message: string) => void;
};

export default function ProfileMenu({ name, initials, role, onNotify }: ProfileMenuProps) {
  const router = useRouter();

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
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => onNotify("Settings opened")}><Settings />Settings</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={() => void signOut()}><LogOut />Sign out</DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>;
}
