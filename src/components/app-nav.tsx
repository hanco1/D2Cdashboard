"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/form", label: "Public Form" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  }

  return pathname === href;
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {links.map((link) => {
        const active = isActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "btn min-h-10 rounded-xl px-3 py-2 text-sm",
              active
                ? "btn-primary"
                : "btn-secondary border border-white/70 bg-white/65 text-slate-600",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
