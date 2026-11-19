"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Film, ListVideo, Ticket } from "lucide-react";

const links = [
  { path: "/", label: "Movies", icon: Film },
  { path: "/rewatch", label: "Rewatch plan", icon: ListVideo },
  { path: "/booking", label: "Booking", icon: Ticket },
];

export function Navigation() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label="Doomsday Ready home">
          <span className="brand-mark">
            <Clapperboard size={23} strokeWidth={2.4} />
          </span>
          <span>
            DOOMSDAY<span className="brand-accent">READY</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          {links.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              aria-current={pathname === path ? "page" : undefined}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
