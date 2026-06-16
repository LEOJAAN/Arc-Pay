"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { navItems, productNavItem } from "@/components/layout/nav-items";
import { UnsupportedNetworkWarning, WalletPanel } from "@/components/wallet/wallet-panel";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ProductIcon = productNavItem.icon;

  return (
    <div className="min-h-screen" style={{ background: "#03142f" }}>

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block"
        style={{
          background: "rgba(3, 20, 47, 0.96)",
          borderRight: "1px solid rgba(79, 140, 255, 0.12)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex h-full flex-col">

          {/* Brand */}
          <Link href="/" className="flex h-16 items-center gap-3 px-5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, #4f8cff 0%, #6d5dfc 50%, #d65dfc 100%)",
                boxShadow: "0 0 16px rgba(109, 93, 252, 0.35)",
              }}
            >
              <ProductIcon className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Arc Payroll</p>
              <p className="text-xs text-[#b7c4d6]">Stablecoin operations</p>
            </div>
          </Link>

          {/* Divider */}
          <div
            className="mx-4 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(79,140,255,0.25), transparent)",
            }}
          />

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 p-3 mt-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "nav-item-active text-[#4f8cff]"
                      : "nav-item text-[#b7c4d6] hover:text-white hover:bg-white/5",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Footer info */}
          <div
            className="m-3 space-y-3 rounded-xl p-4"
            style={{
              background: "rgba(37, 99, 255, 0.06)",
              border: "1px solid rgba(79, 140, 255, 0.15)",
            }}
          >
            <Badge variant="outline" className="text-xs">Arc Testnet only</Badge>
            <p className="text-xs leading-5 text-[#b7c4d6]">
              Chain ID 5042002. Payroll execution is intentionally not implemented yet.
            </p>
            <div className="pt-2.5 border-t border-[#4f8cff]/10 flex items-center">
              <a
                href="https://x.com/janmd07"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-[#b7c4d6] hover:text-white transition-all group font-medium w-full justify-between"
              >
                <span>Built by janmd</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6d5dfc]/10 border border-[#6d5dfc]/20 text-[#4f8cff] group-hover:bg-[#6d5dfc]/20 group-hover:border-[#6d5dfc]/40 shadow-[0_0_10px_rgba(109,93,252,0.1)] transition-all duration-300">
                  <svg className="h-2.5 w-2.5 text-[#4f8cff] fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Follow on X
                </span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────── */}
      <div className="lg:pl-64">

        {/* Header */}
        <header
          className="sticky top-0 z-20"
          style={{
            background: "rgba(3, 20, 47, 0.90)",
            borderBottom: "1px solid rgba(79, 140, 255, 0.10)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

            {/* Mobile brand */}
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="flex items-center gap-2 lg:hidden">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, #4f8cff 0%, #6d5dfc 50%, #d65dfc 100%)",
                    boxShadow: "0 0 12px rgba(109, 93, 252, 0.30)",
                  }}
                >
                  <ProductIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">Arc Payroll</span>
              </Link>
              <Badge variant="default" className="text-xs">Arc Testnet</Badge>
            </div>

            <WalletPanel />

            {/* Mobile nav */}
            <nav className="flex gap-1 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-[#6d5dfc]/12 text-[#bfdbfe] border border-[#6d5dfc]/25 shadow-[0_0_10px_rgba(109,93,252,0.15)]"
                        : "text-[#b7c4d6] hover:text-white hover:bg-white/5",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <UnsupportedNetworkWarning />
          {children}
        </main>
      </div>
    </div>
  );
}
