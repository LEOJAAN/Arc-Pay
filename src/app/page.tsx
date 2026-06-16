"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Landmark,
  Shield,
  WalletCards,
  TrendingUp,
  Zap,
  Activity,
  ArrowUpRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ─────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────── */
const pillars = [
  {
    title: "Arc-only rails",
    description:
      "Network configuration pinned to Arc Testnet from day one — no cross-chain confusion, no wrong-chain risk.",
    icon: Shield,
    iconColor: "text-blue-400",
    glowRgb: "37, 99, 255",
    accentRgb: "79, 140, 255",
  },
  {
    title: "Contributor payroll",
    description:
      "Organize payout recipients and payroll cycles before execution is added. Clean structure, zero chaos.",
    icon: WalletCards,
    iconColor: "text-violet-400",
    glowRgb: "109, 93, 252",
    accentRgb: "139, 92, 246",
  },
  {
    title: "Treasury clarity",
    description:
      "A dedicated workspace for balances, funding status, and payment readiness — all in one view.",
    icon: Landmark,
    iconColor: "text-sky-400",
    glowRgb: "56, 189, 248",
    accentRgb: "125, 211, 252",
  },
];

const metrics = [
  {
    label: "Upcoming payroll",
    value: "$48,200",
    delta: "+12% this cycle",
    icon: TrendingUp,
    rgb: "37, 99, 255",
    iconColor: "#4f8cff",
  },
  {
    label: "Treasury runway",
    value: "7.4 mo",
    delta: "Stable",
    icon: Zap,
    rgb: "109, 93, 252",
    iconColor: "#a78bfa",
  },
  {
    label: "Contributors",
    value: "18",
    delta: "+3 this period",
    icon: Activity,
    rgb: "16, 185, 129",
    iconColor: "#34d399",
  },
];

const bars = [
  { label: "Core contributors", pct: 82, from: "#4f8cff", to: "#d65dfc" },
  { label: "Protocol rewards",  pct: 64, from: "#6d5dfc", to: "#818cf8" },
  { label: "Advisory allocation", pct: 48, from: "#38bdf8", to: "#6d5dfc" },
];

const transactions = [
  { name: "Sarah Chen",     role: "Protocol Eng.",   amount: "$4,200", status: "Ready",   rgb: "16,185,129",  statusColor: "#34d399"  },
  { name: "Marcus Lee",     role: "Smart Contracts", amount: "$3,800", status: "Staged",  rgb: "109,93,252",  statusColor: "#bfdbfe"  },
  { name: "Ana Gutierrez",  role: "Research Lead",   amount: "$5,100", status: "Pending", rgb: "245,158,11",  statusColor: "#fbbf24"  },
  { name: "James Park",     role: "Frontend Dev",    amount: "$3,600", status: "Ready",   rgb: "16,185,129",  statusColor: "#34d399"  },
];

const trustItems = ["Chain ID 5042002", "RPC configured", "Explorer ready"];

// Deterministic particle positions — no Math.random (hydration-safe)
const particles = [
  { x: 7,  y: 14, s: 2,   blue: true,  dur: 12, delay: 0   },
  { x: 19, y: 5,  s: 1.5, blue: false, dur: 15, delay: 2   },
  { x: 44, y: 9,  s: 1,   blue: false, dur: 10, delay: 1   },
  { x: 77, y: 7,  s: 2,   blue: true,  dur: 14, delay: 3   },
  { x: 91, y: 18, s: 1.5, blue: false, dur: 11, delay: 0.5 },
  { x: 86, y: 53, s: 1,   blue: true,  dur: 16, delay: 1.5 },
  { x: 94, y: 74, s: 2,   blue: false, dur: 13, delay: 2.5 },
  { x: 71, y: 87, s: 1.5, blue: true,  dur: 12, delay: 4   },
  { x: 38, y: 91, s: 1,   blue: false, dur: 17, delay: 0.8 },
  { x: 11, y: 79, s: 2,   blue: true,  dur: 11, delay: 3.5 },
  { x: 4,  y: 49, s: 1.5, blue: false, dur: 14, delay: 1.8 },
  { x: 53, y: 3,  s: 1,   blue: true,  dur: 13, delay: 2.2 },
  { x: 64, y: 68, s: 1.5, blue: false, dur: 15, delay: 0.3 },
  { x: 29, y: 58, s: 1,   blue: true,  dur: 10, delay: 4.5 },
  { x: 17, y: 38, s: 2,   blue: false, dur: 12, delay: 1.2 },
];

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!logoRef.current) return;
    const rect = logoRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const maxTilt = 6;
    setTilt({
      x: x * maxTilt,
      y: -y * maxTilt,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "#020817" }}>

      {/* ── Grain overlay ─────────────────────────────── */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] overflow-hidden" style={{ background: "#020817" }}>

        {/* Floating orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        {/* Perspective grid */}
        <div className="hero-grid" aria-hidden="true" />

        {/* Floating particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {particles.map((p, i) => (
            <span
              key={i}
              className="particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.s}px`,
                height: `${p.s}px`,
                background: p.blue ? "#4f8cff" : "rgba(255,255,255,0.45)",
                boxShadow: p.blue
                  ? `0 0 ${p.s * 5}px rgba(79,140,255,0.85)`
                  : `0 0 ${p.s * 3}px rgba(255,255,255,0.40)`,
                animation: `${i % 2 === 0 ? "particle-float" : "particle-float-alt"} ${p.dur}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* ── Hero copy — centered ── */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-36 pb-10 sm:px-6 lg:px-8 text-center">

          {/* Status chips */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold badge-live tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Arc Testnet · Live
            </span>
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold badge-arc tracking-wide">
              <Activity className="h-3 w-3" />
              Stablecoin payroll
            </span>
          </div>

          {/* Logo mark — glowing centerpiece */}
          <div className="relative mb-8 inline-flex items-center justify-center group cursor-pointer">
            {/* Soft breathing blue aura behind the logo */}
            <div 
              className="absolute -inset-12 pointer-events-none transition-all duration-700 opacity-60 group-hover:opacity-95 group-hover:scale-110" 
              aria-hidden="true" 
            >
              <div className="w-full h-full rounded-full logo-glow-aura animate-logo-glow" />
            </div>
            {/* Logo image container with perspective, smooth mouse-follow tilt and hover scale */}
            <div 
              ref={logoRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative z-10 w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48"
              style={{ 
                perspective: 800,
                transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(${isHovered ? 1.04 : 1})`,
                transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Animating container that floats and rotates in 3D */}
              <div className="w-full h-full animate-logo-float">
                <Image
                  src="/arc-logo.png"
                  alt="Arc logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Display heading */}
          <h1
            className="mb-6 font-extrabold gradient-text inline-block"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.04em",
            }}
          >
            Payroll for the
            <br />
            open internet
          </h1>

          {/* Subtitle */}
          <p
            className="mx-auto mb-10 max-w-lg text-lg leading-relaxed"
            style={{ color: "#64748b" }}
          >
            Stablecoin payroll infrastructure for crypto-native teams.
            Structured cycles, treasury clarity, and on-chain payment
            readiness — running on Arc Testnet.
          </p>

          {/* CTA row */}
          <div className="mb-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2 text-[15px] px-7 h-12">
              <Link href="/dashboard">
                Open workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-[15px] px-7 h-12">
              <Link href="/settings">Review settings</Link>
            </Button>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#4f8cff" }} />
                <span className="text-sm" style={{ color: "#475569" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dashboard reveal — 3-D tilted product card ── */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-0 sm:px-6 lg:px-8 dashboard-reveal">
          <div className="dashboard-outer">
            <div className="dashboard-tilt">

              {/* Gradient-border shell */}
              <div className="glow-border-shell">
                <div className="dashboard-card rounded-[17px] overflow-hidden">

                  {/* Window chrome */}
                  <div
                    className="flex items-center justify-between px-5 py-3.5"
                    style={{ borderBottom: "1px solid rgba(79,140,255,0.11)" }}
                  >
                    {/* macOS dots */}
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
                      <span className="h-3 w-3 rounded-full" style={{ background: "#ffbd2e" }} />
                      <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
                    </div>

                    {/* Tab bar */}
                    <div
                      className="hidden sm:flex items-center gap-0.5 rounded-lg p-1"
                      style={{ background: "rgba(2,8,23,0.70)" }}
                    >
                      {["Payroll", "Contributors", "Treasury"].map((t, i) => (
                        <button
                          key={t}
                          className="rounded-md px-3 py-1 text-xs font-medium transition-all"
                          style={
                            i === 0
                              ? {
                                  background: "rgba(37,99,255,0.22)",
                                  color: "#93c5fd",
                                  border: "1px solid rgba(79,140,255,0.28)",
                                }
                              : { color: "#334155" }
                          }
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold badge-arc">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                      Arc Testnet
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3.5">

                    {/* Metric tiles */}
                    <div className="grid grid-cols-3 gap-3">
                      {metrics.map(({ label, value, delta, icon: Icon, rgb, iconColor }) => (
                        <div
                          key={label}
                          className="rounded-xl p-3.5 border-glow-hover"
                          style={{
                            background: "rgba(2,8,23,0.60)",
                            border: "1px solid rgba(79,140,255,0.12)",
                          }}
                        >
                          <div className="mb-2.5 flex items-center justify-between">
                            <p className="text-[11px] font-medium" style={{ color: "#334155" }}>
                              {label}
                            </p>
                            <div
                              className="rounded-lg p-1.5"
                              style={{
                                background: `rgba(${rgb},0.14)`,
                                border: `1px solid rgba(${rgb},0.25)`,
                              }}
                            >
                              <Icon className="h-3 w-3" style={{ color: iconColor }} />
                            </div>
                          </div>
                          <p className="text-xl font-bold tracking-tight text-white">{value}</p>
                          <p className="mt-0.5 text-[11px]" style={{ color: "#4f8cff" }}>{delta}</p>
                        </div>
                      ))}
                    </div>

                    {/* Progress bars */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "rgba(2,8,23,0.60)",
                        border: "1px solid rgba(79,140,255,0.10)",
                      }}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-xs font-semibold text-white">Cycle preparation</p>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          style={{
                            background: "rgba(37,99,255,0.11)",
                            border: "1px solid rgba(79,140,255,0.22)",
                            color: "#93c5fd",
                          }}
                        >
                          Jun 29
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {bars.map(({ label, pct, from, to }, i) => (
                          <div key={label}>
                            <div className="mb-1.5 flex justify-between text-[11px]">
                              <span style={{ color: "#475569" }}>{label}</span>
                              <span className="font-bold text-white">{pct}%</span>
                            </div>
                            <div
                              className="h-1.5 rounded-full overflow-hidden"
                              style={{ background: "rgba(255,255,255,0.04)" }}
                            >
                              <div
                                className={`h-1.5 rounded-full animate-bar ${
                                  i === 0 ? "animate-bar-delay-1"
                                  : i === 1 ? "animate-bar-delay-2"
                                  : "animate-bar-delay-3"
                                }`}
                                style={{
                                  width: `${pct}%`,
                                  background: `linear-gradient(to right, ${from}, ${to})`,
                                  boxShadow: `0 0 8px ${from}88`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contributor table */}
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid rgba(79,140,255,0.10)" }}
                    >
                      {/* Table header */}
                      <div
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{
                          background: "rgba(2,8,23,0.75)",
                          borderBottom: "1px solid rgba(79,140,255,0.09)",
                        }}
                      >
                        <p className="text-xs font-semibold text-white">Staged contributors</p>
                        <button
                          className="text-xs font-medium flex items-center gap-1"
                          style={{ color: "#4f8cff" }}
                        >
                          View all 18
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Rows */}
                      {transactions.map((tx, i) => (
                        <div
                          key={tx.name}
                          className="flex items-center justify-between px-4 py-2.5 transition-all duration-200 hover:brightness-110"
                          style={{
                            background:
                              i % 2 === 0
                                ? "rgba(2,8,23,0.45)"
                                : "rgba(2,8,23,0.28)",
                            borderBottom:
                              i < transactions.length - 1
                                ? "1px solid rgba(79,140,255,0.06)"
                                : "none",
                          }}
                        >
                          {/* Avatar + name */}
                          <div className="flex items-center gap-3">
                            <div
                              className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{
                                background: `radial-gradient(circle at top left, rgba(${tx.rgb},0.50), rgba(${tx.rgb},0.20))`,
                                border: `1px solid rgba(${tx.rgb},0.28)`,
                              }}
                            >
                              {tx.name[0]}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white leading-none mb-0.5">
                                {tx.name}
                              </p>
                              <p className="text-[11px]" style={{ color: "#334155" }}>
                                {tx.role}
                              </p>
                            </div>
                          </div>

                          {/* Amount + status */}
                          <div className="flex items-center gap-3">
                            <p className="text-xs font-bold text-white">{tx.amount}</p>
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                              style={{
                                background: `rgba(${tx.rgb},0.12)`,
                                border: `1px solid rgba(${tx.rgb},0.26)`,
                                color: tx.statusColor,
                              }}
                            >
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer strip */}
                  <div
                    className="flex items-center justify-between px-5 py-3"
                    style={{
                      background: "rgba(2,8,23,0.60)",
                      borderTop: "1px solid rgba(79,140,255,0.09)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-xs" style={{ color: "#334155" }}>
                        Next cycle in 14 days
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold" style={{ color: "#4f8cff" }}>
                        Jun 29, 2025
                      </p>
                      <ArrowUpRight className="h-3 w-3" style={{ color: "#4f8cff" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade into pillars section */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(2,8,23,0.97) 100%)",
          }}
          aria-hidden="true"
        />
      </section>

      {/* ══════════════════════════════════════════════
          SECTION DIVIDER
      ══════════════════════════════════════════════ */}
      <div className="section-divider mx-auto max-w-5xl" />

      {/* ══════════════════════════════════════════════
          PILLARS
      ══════════════════════════════════════════════ */}
      <section
        className="relative"
        style={{ background: "linear-gradient(180deg, #020817 0%, #040d1f 60%, #020817 100%)" }}
      >
        {/* Ambient glow behind cards */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-72 w-full max-w-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(109,93,252,0.12) 0%, transparent 70%)",
            filter: "blur(48px)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">

          {/* Heading */}
          <div className="mb-16 space-y-4 text-center">
            <p
              className="text-xs font-bold tracking-[0.28em] uppercase"
              style={{ color: "#4f8cff" }}
            >
              Infrastructure
            </p>
            <h2
              className="text-4xl font-extrabold text-white sm:text-5xl"
              style={{ letterSpacing: "-0.03em" }}
            >
              Built for the chain
            </h2>
            <p
              className="mx-auto max-w-lg text-lg leading-relaxed"
              style={{ color: "#334155" }}
            >
              Purpose-built for Arc Testnet — structured, auditable,
              and chain-native from the ground up.
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <Card
                key={pillar.title}
                className="group relative cursor-default overflow-hidden hover:-translate-y-2 border-glow-hover"
                style={{
                  background: "rgba(4,10,28,0.80)",
                  border: "1px solid rgba(79,140,255,0.10)",
                  boxShadow:
                    "0 4px 28px rgba(2,8,23,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
              >
                {/* Ambient inner glow (shows on hover via group) */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(ellipse at top left, rgba(${pillar.glowRgb},0.10) 0%, transparent 65%)`,
                  }}
                  aria-hidden="true"
                />

                {/* Top accent line — visible on hover */}
                <div
                  className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to right, transparent, rgba(${pillar.accentRgb},0.50), transparent)`,
                  }}
                  aria-hidden="true"
                />

                <CardHeader className="relative z-10 pb-3 pt-6">
                  <div
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-premium group-hover:scale-110"
                    style={{
                      background: `rgba(${pillar.glowRgb},0.12)`,
                      border: `1px solid rgba(${pillar.glowRgb},0.24)`,
                      boxShadow: `0 0 20px rgba(${pillar.glowRgb},0.18)`,
                    }}
                  >
                    <pillar.icon className={`h-5 w-5 ${pillar.iconColor}`} />
                  </div>
                  <CardTitle className="text-[15px] font-semibold text-white">
                    {pillar.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10">
                  <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <div className="section-divider mx-auto max-w-5xl" />
      <footer style={{ background: "#020817" }}>
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
             <div
               className="h-7 w-7 rounded-lg flex items-center justify-center"
               style={{
                 background: "linear-gradient(135deg, #4f8cff 0%, #6d5dfc 50%, #d65dfc 100%)",
                 boxShadow: "0 0 14px rgba(109,93,252,0.40)",
               }}
             >
              <span className="text-white text-[10px] font-extrabold">A</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <p className="text-xs text-slate-400">
                Arc Payroll · Arc Testnet · Chain ID 5042002
              </p>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs text-slate-500 font-medium">Testnet connected</p>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <a
              href="https://x.com/janmd07"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-all group font-medium"
            >
              <span>Built by janmd</span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6d5dfc]/10 border border-[#6d5dfc]/20 text-[#4f8cff] group-hover:bg-[#6d5dfc]/20 group-hover:border-[#6d5dfc]/40 shadow-[0_0_10px_rgba(109,93,252,0.1)] transition-all duration-300">
                <svg className="h-2.5 w-2.5 text-[#4f8cff] fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Follow on X
              </span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
