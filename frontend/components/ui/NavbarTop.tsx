"use client";

import { useRouter } from "next/navigation";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { logout } from "@/lib/storage";

export function NavbarTop() {
  const router = useRouter();

  return (
    <Navbar maxWidth="xl" isBordered>
      <NavbarBrand className="gap-2">
        <div className="h-7 w-7 rounded-xl bg-default-200" />
        <p className="font-semibold">Application Tracker</p>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            variant="flat"
            onPress={() => {
              logout();
              router.replace("/");
            }}
          >
            Log out
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
