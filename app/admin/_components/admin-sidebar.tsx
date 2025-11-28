"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها" },
  { href: "/admin/products", label: "محصولات" },
  { href: "/admin/orders", label: "سفارش‌ها" },
  { href: "/admin/users", label: "کاربران" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-end text-right font-medium transition-colors",
                  isActive
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "hover:bg-foreground/10"
                )}
              >
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

