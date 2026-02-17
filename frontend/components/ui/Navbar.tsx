'use client';

import {
    Navbar as HeroUINavbar,
    NavbarContent,
    NavbarMenu,
    NavbarMenuToggle,
    NavbarBrand,
    NavbarItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import {
    DropdownItem,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    Avatar,
} from "@heroui/react";
import React from "react";
import clsx from "clsx";
import apiRouter from "@/api/router";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useQuery, useQueryClient } from "@tanstack/react-query";


interface SearchIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    strokeWidth?: number;
    width?: number;
    height?: number;
}

export const SearchIcon = ({
                               size = 24,
                               strokeWidth = 1.5,
                               width,
                               height,
                               ...props
                           }: SearchIconProps) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height={height || size}
        role="presentation"
        viewBox="0 0 24 24"
        width={width || size}
        {...props}
    >
        <path
            d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
        />
        <path
            d="M22 22L20 20"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
        />
    </svg>
);


type NavMenuItem = (typeof siteConfig.navMenuItems)[number];

const isLogoutItem = (
    item: NavMenuItem
): item is { label: string; action: "logout" } =>
    "action" in item && item.action === "logout";

const isLinkItem = (
    item: NavMenuItem
): item is { label: string; href: string } =>
    "href" in item && typeof item.href === "string";


export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: userData } = useQuery({
        queryKey: ["showUser"],
        queryFn: () => apiRouter.sessions.showUser(),
    });

    const handleMenuItem = async (item: NavMenuItem) => {
        if (isLogoutItem(item)) {
            await apiRouter.sessions.destroySession();
            queryClient.clear();
            router.push("/");
            setIsMenuOpen(false);
            return;
        }

        if (isLinkItem(item)) {
            router.push(item.href); // ✅ string guaranteed
            setIsMenuOpen(false);
        }
    };


    return (
        <HeroUINavbar
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            maxWidth="xl"
            position="static"
            shouldHideOnScroll
        >
            {/* LEFT */}
            <NavbarContent className="flex-1 justify-start items-center gap-4">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="lg:hidden"
                />

                <NavbarBrand className="gap-3 max-w-fit">
                    <Link href="/dashboard">
                        <p className=" font-bold text-inherit">
                            Application Manager
                        </p>
                    </Link>
                </NavbarBrand>

                <ul className="hidden lg:flex gap-4 justify-start ml-2">
                    {siteConfig.navItems.map((item) => (
                        <NavbarItem key={item.href}>
                            <Link
                                className={clsx(
                                    "data-[active=true]:text-primary data-[active=true]:font-medium"
                                )}
                                color="foreground"
                                href={item.href}
                            >
                                {item.label}
                            </Link>
                        </NavbarItem>
                    ))}
                </ul>
            </NavbarContent>

            {/* RIGHT */}
            <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
                <NavbarItem className="hidden sm:flex gap-2">
                    <Input
                        classNames={{
                            base: "h-10 w-[200px]",
                            mainWrapper: "h-full",
                            input: "text-small",
                            inputWrapper:
                                "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                        }}
                        placeholder="Search..."
                        size="sm"
                        startContent={<SearchIcon size={18} />}
                        type="search"
                    />
                </NavbarItem>

                {/* Avatar Menu */}
                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <Avatar
                            isBordered
                            as="button"
                            className="transition-transform"
                            color="secondary"
                            name={userData?.user?.name}
                            size="sm"
                        />
                    </DropdownTrigger>

                    <DropdownMenu aria-label="Profile Actions" variant="flat">
                        {siteConfig.navMenuItems.map((item) => (
                            <DropdownItem
                                key={item.label}
                                color={item.action === "logout" ? "danger" : "default"}
                                onPress={() => handleMenuItem(item)}
                            >
                                {item.label}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            </NavbarContent>

            {/* MOBILE MENU */}
            <NavbarMenu>
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {siteConfig.navMenuItems.map((item) => (
                        <NavbarItem key={item.label}>
                            <Link
                                color="foreground"
                                href="#"
                                onPress={() => handleMenuItem(item)}
                            >
                                {item.label}
                            </Link>
                        </NavbarItem>
                    ))}
                </div>
            </NavbarMenu>
        </HeroUINavbar>
    );
};