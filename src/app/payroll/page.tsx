"use client";

import { useState, useEffect } from "react";
import { 
  CalendarDays, 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  History, 
  ExternalLink, 
  Copy, 
  Check, 
  Play, 
  ArrowRight,
  ShieldCheck,
  Plus,
  Loader2,
  X,
  AlertOctagon,
  AlertTriangle
} from "lucide-react";
import { useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { formatUnits, parseUnits } from "viem";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { shortenAddress, useArcWallet } from "@/components/wallet/use-arc-wallet";
import { cn } from "@/lib/utils";

type Contributor = {
  id: string;
  fullName: string;
  walletAddress: string;
  role: string;
  salaryAmount: number;
  status: "Active" | "Suspended";
  startDate?: string;
  frequency?: "Weekly" | "Monthly";
  payoutDay?: number | string;
};

type PayrollBatch = {
  id: string;
  month: string;
  recipientsCount: number;
  totalAmount: number;
  status: "Draft" | "Pending" | "Approved" | "Paid" | "Partially Paid";
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  executedAt?: string;
  type?: "Weekly" | "Monthly";
  period?: string;
  weekStart?: string;
  weekEnd?: string;
  contributors: {
    id: string;
    fullName: string;
    walletAddress: string;
    role: string;
    salaryAmount: number;
    status?: "Awaiting" | "Pending" | "Paid" | "Failed";
    txHash?: string;
    errorMsg?: string;
    frequency?: "Weekly" | "Monthly";
    scheduledDate?: string;
  }[];
};

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "success", type: "bool" }]
  }
] as const;

const MONTH_OPTIONS = [
  "May 2026",
  "June 2026",
  "July 2026",
  "August 2026",
  "September 2026",
  "October 2026",
  "November 2026",
  "December 2026",
];

const generateWeeklyPeriods = (year: number) => {
  const periods: { startStr: string; endStr: string; label: string }[] = [];
  let currentStart = new Date(year, 0, 1, 0, 0, 0);
  const endYearLimit = new Date(year, 11, 31, 23, 59, 59);

  const formatPeriodDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${day} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  while (currentStart <= endYearLimit) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentStart.getDate() + 6);

    const label = `${formatPeriodDate(currentStart)} - ${formatPeriodDate(currentEnd)}`;
    periods.push({
      startStr: currentStart.toISOString().split("T")[0],
      endStr: currentEnd.toISOString().split("T")[0],
      label
    });

    const nextStart = new Date(currentEnd);
    nextStart.setDate(currentEnd.getDate() + 1);
    currentStart = nextStart;
  }
  return periods;
};

export default function PayrollPage() {
  const [mounted, setMounted] = useState(false);
  const { isConnected, address, isArcTestnet, switchToArcTestnet, isSwitching } = useArcWallet();
  const [storageError, setStorageError] = useState(false);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [batches, setBatches] = useState<PayrollBatch[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  
  // Selection/form states
  const currentMonthYear = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const defaultMonth = MONTH_OPTIONS.includes(currentMonthYear) ? currentMonthYear : MONTH_OPTIONS[0];
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [weeklyPeriods, setWeeklyPeriods] = useState<{ startStr: string; endStr: string; label: string }[]>([]);
  const [selectedWeeklyPeriodIndex, setSelectedWeeklyPeriodIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal & Payout Execution States
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecutionIndex, setCurrentExecutionIndex] = useState(-1);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  
  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Wagmi wallet read/write hooks
  const { data: usdcBalance, refetch: refetchUsdc } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: isArcTestnet && address ? [address] : undefined,
    query: {
      enabled: !!isArcTestnet && !!address,
    }
  });

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  useEffect(() => {
    setMounted(true);
    // Load contributors
    const storedContributors = localStorage.getItem("arc_contributors");
    if (storedContributors) {
      try {
        setContributors(JSON.parse(storedContributors));
      } catch {
        setContributors([]);
        setStorageError(true);
      }
    }
    
    // Load payroll batches (starts empty)
    const storedBatches = localStorage.getItem("arc_payroll_batches");
    if (storedBatches) {
      try {
        const parsed = JSON.parse(storedBatches);
        setBatches(parsed);
        if (parsed.length > 0) {
          setActiveBatchId(parsed[0].id);
        }
      } catch {
        setBatches([]);
        setStorageError(true);
      }
    }

    // Generate weekly periods for current year
    const currentYear = new Date().getFullYear();
    const periods = generateWeeklyPeriods(currentYear);
    setWeeklyPeriods(periods);

    // Default to the period containing today's date
    const today = new Date().toISOString().split("T")[0];
    const foundIndex = periods.findIndex(
      (p) => today >= p.startStr && today <= p.endStr
    );
    setSelectedWeeklyPeriodIndex(foundIndex !== -1 ? foundIndex : 0);
  }, []);

  const saveBatches = (newBatches: PayrollBatch[]) => {
    setBatches(newBatches);
    localStorage.setItem("arc_payroll_batches", JSON.stringify(newBatches));
  };

  const handleCopy = (id: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate Monthly Batch
  const handleGenerateMonthlyBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const MONTH_NAMES = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const [monthName, yearStr] = selectedMonth.split(" ");
    const monthIndex = MONTH_NAMES.indexOf(monthName);
    const year = parseInt(yearStr);
    
    // Use last day of the selected month as reference date
    const refDate = new Date(year, monthIndex + 1, 0);
    const batchName = `Monthly Run - ${selectedMonth}`;

    // Prevent duplicate monthly run
    const duplicateExists = batches.some(b => 
      (b.type === "Monthly" && b.period === selectedMonth) || 
      b.month === batchName
    );
    if (duplicateExists) {
      setError(`A monthly payroll batch for ${selectedMonth} already exists.`);
      return;
    }

    const activeContributors = contributors.filter(
      c => c.status === "Active" && (c.frequency === "Monthly" || !c.frequency)
    );
    if (activeContributors.length === 0) {
      setError("No active monthly contributors found in directory. Please add active contributors first.");
      return;
    }

    const formatLocalDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    };

    const getDueDate = (c: Contributor): Date | null => {
      const start = new Date((c.startDate || "2026-06-01") + "T00:00:00");
      if (start > refDate) {
        return null;
      }

      const scheduled = new Date(refDate.getFullYear(), refDate.getMonth(), Number(c.payoutDay || 1));
      if (scheduled <= refDate) {
        if (scheduled >= start) return scheduled;
      } else {
        const prevScheduled = new Date(refDate.getFullYear(), refDate.getMonth() - 1, Number(c.payoutDay || 1));
        if (prevScheduled >= start) return prevScheduled;
      }
      return null;
    };

    const dueContributorsData = activeContributors
      .map(c => ({ c, dueDate: getDueDate(c) }))
      .filter((item): item is { c: Contributor; dueDate: Date } => item.dueDate !== null);

    if (dueContributorsData.length === 0) {
      setError("No contributors are due for this payroll period.");
      return;
    }

    const totalAmount = dueContributorsData.reduce((sum, item) => sum + item.c.salaryAmount, 0);

    const timestamp = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const newBatch: PayrollBatch = {
      id: `batch-${Date.now()}`,
      month: batchName,
      recipientsCount: dueContributorsData.length,
      totalAmount,
      status: "Draft",
      createdAt: timestamp,
      type: "Monthly",
      period: selectedMonth,
      contributors: dueContributorsData.map(item => ({
        id: item.c.id,
        fullName: item.c.fullName,
        walletAddress: item.c.walletAddress,
        role: item.c.role,
        salaryAmount: item.c.salaryAmount,
        status: "Awaiting" as const,
        frequency: item.c.frequency || "Monthly",
        scheduledDate: formatLocalDate(item.dueDate)
      }))
    };

    const updatedBatches = [newBatch, ...batches];
    saveBatches(updatedBatches);
    setActiveBatchId(newBatch.id);
    setSuccess(`Successfully generated Draft payroll batch for ${selectedMonth}.`);
  };

  // Generate Weekly Batch
  const handleGenerateWeeklyBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (weeklyPeriods.length === 0) {
      setError("Weekly periods are not initialized.");
      return;
    }

    const selectedPeriod = weeklyPeriods[selectedWeeklyPeriodIndex];
    if (!selectedPeriod) {
      setError("Selected weekly period is invalid.");
      return;
    }

    const start = new Date(selectedPeriod.startStr + "T00:00:00");
    const end = new Date(selectedPeriod.endStr + "T00:00:00");
    const batchName = `Weekly Run - ${selectedPeriod.label.replace(" - ", " to ")}`;

    // Prevent duplicate weekly run
    const duplicateExists = batches.some(b => 
      (b.type === "Weekly" && b.period === selectedPeriod.label) || 
      b.month === batchName
    );
    if (duplicateExists) {
      setError(`A weekly payroll batch for ${selectedPeriod.label} already exists.`);
      return;
    }

    const activeContributors = contributors.filter(
      c => c.status === "Active" && c.frequency === "Weekly"
    );
    if (activeContributors.length === 0) {
      setError("No active weekly contributors found in directory. Please add active contributors first.");
      return;
    }

    const formatLocalDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    };

    const getWeeklyDueDateInRange = (c: Contributor): Date | null => {
      const contributorStart = new Date((c.startDate || "2026-05-01") + "T00:00:00");
      
      const weekdays: Record<string, number> = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6
      };
      const targetDay = weekdays[c.payoutDay || "Friday"] ?? 5;

      // Find the date in [start, end] range that matches targetDay
      let scheduled: Date | null = null;
      const curr = new Date(start);
      for (let i = 0; i < 7; i++) {
        if (curr.getDay() === targetDay) {
          scheduled = new Date(curr);
          break;
        }
        curr.setDate(curr.getDate() + 1);
      }

      if (scheduled && scheduled >= contributorStart && scheduled <= end) {
        return scheduled;
      }
      return null;
    };

    const dueContributorsData = activeContributors
      .map(c => ({ c, dueDate: getWeeklyDueDateInRange(c) }))
      .filter((item): item is { c: Contributor; dueDate: Date } => item.dueDate !== null);

    if (dueContributorsData.length === 0) {
      setError("No contributors are due for this payroll period.");
      return;
    }

    const totalAmount = dueContributorsData.reduce((sum, item) => sum + item.c.salaryAmount, 0);

    const timestamp = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const newBatch: PayrollBatch = {
      id: `batch-${Date.now()}`,
      month: batchName,
      recipientsCount: dueContributorsData.length,
      totalAmount,
      status: "Draft",
      createdAt: timestamp,
      type: "Weekly",
      period: selectedPeriod.label,
      weekStart: selectedPeriod.startStr,
      weekEnd: selectedPeriod.endStr,
      contributors: dueContributorsData.map(item => ({
        id: item.c.id,
        fullName: item.c.fullName,
        walletAddress: item.c.walletAddress,
        role: item.c.role,
        salaryAmount: item.c.salaryAmount,
        status: "Awaiting" as const,
        frequency: "Weekly",
        scheduledDate: formatLocalDate(item.dueDate)
      }))
    };

    const updatedBatches = [newBatch, ...batches];
    saveBatches(updatedBatches);
    setActiveBatchId(newBatch.id);
    setSuccess(`Successfully generated Draft payroll batch for ${selectedPeriod.label}.`);
  };

  // Advance pipeline status
  const handleAdvanceStatus = (batchId: string, nextStatus: "Pending" | "Approved") => {
    setError(null);
    setSuccess(null);

    const timestamp = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const updated = batches.map(b => {
      if (b.id === batchId) {
        return {
          ...b,
          status: nextStatus,
          submittedAt: nextStatus === "Pending" ? timestamp : b.submittedAt,
          approvedAt: nextStatus === "Approved" ? timestamp : b.approvedAt
        };
      }
      return b;
    });

    saveBatches(updated);
    setSuccess(`Payroll batch advanced to ${nextStatus}.`);
  };

  // Sequential USDC Payout loop
  const handleExecutePayout = async () => {
    const activeBatch = batches.find(b => b.id === activeBatchId);
    if (!activeBatch || !address) return;

    setError(null);
    setSuccess(null);
    setPayoutError(null);
    setIsExecuting(true);

    const timestamp = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const updatedContributors = activeBatch.contributors.map(c => ({ ...c }));
    let allSucceeded = true;
    let anySucceeded = false;

    for (let i = 0; i < updatedContributors.length; i++) {
      const c = updatedContributors[i];
      setCurrentExecutionIndex(i);

      // Set status to Pending
      updatedContributors[i].status = "Pending";
      
      // Update state in real-time for visual tracking
      const tempBatches = batches.map(b => 
        b.id === activeBatch.id ? { ...b, contributors: [...updatedContributors] } : b
      );
      setBatches(tempBatches);

      try {
        // Use parseUnits to scale salary amounts to 6 decimals
        const amountUnits = parseUnits(c.salaryAmount.toString(), 6);

        // Execute ERC20 transfer directly from connected wallet
        const hash = await writeContractAsync({
          address: USDC_ADDRESS,
          abi: ERC20_TRANSFER_ABI,
          functionName: "transfer",
          args: [c.walletAddress as `0x${string}`, amountUnits],
        });

        // Wait for mining confirmation on-chain
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash });
        }

        // Mark recipient as Paid
        updatedContributors[i].status = "Paid";
        updatedContributors[i].txHash = hash;
        anySucceeded = true;
      } catch (error) {
        allSucceeded = false;
        const err = error as { name?: string; code?: number; message?: string; shortMessage?: string };
        const msg = err.shortMessage || err.message || "Transaction failed";
        updatedContributors[i].status = "Failed";
        updatedContributors[i].errorMsg = msg;

        const isUserRejection = 
          err.name === "UserRejectedRequestError" || 
          err.code === 4001 || 
          /user rejected/i.test(err.message || "") ||
          /user rejected/i.test(err.shortMessage || "");

        if (isUserRejection) {
          updatedContributors[i].errorMsg = "User rejected signature request";
          setPayoutError("Execution cancelled by user.");
          
          for (let j = i + 1; j < updatedContributors.length; j++) {
            updatedContributors[j].status = "Awaiting";
          }
          break;
        }
      }

      // Update state in real-time
      const tempBatchesFinal = batches.map(b => 
        b.id === activeBatch.id ? { ...b, contributors: [...updatedContributors] } : b
      );
      setBatches(tempBatchesFinal);
    }

    setIsExecuting(false);
    setCurrentExecutionIndex(-1);

    // Compute final batch status
    let finalStatus: "Paid" | "Partially Paid" | "Approved" = "Approved";
    if (allSucceeded) {
      finalStatus = "Paid";
    } else if (anySucceeded) {
      finalStatus = "Partially Paid";
    } else {
      finalStatus = "Approved";
      setPayoutError("All transactions failed. The payroll status remains Approved.");
    }

    const finalBatchesList = batches.map(b => 
      b.id === activeBatch.id ? { 
        ...b, 
        status: finalStatus, 
        executedAt: finalStatus !== "Approved" ? timestamp : undefined,
        contributors: updatedContributors 
      } : b
    );

    saveBatches(finalBatchesList);
    refetchUsdc(); // Refresh active USDC balance after execution completes

    if (finalStatus === "Paid") {
      setSuccess("Payroll batch executed successfully! All payments transferred.");
      setIsPayoutModalOpen(false);
    } else if (finalStatus === "Partially Paid") {
      setError("Payroll batch completed with errors. Some payouts failed.");
      setIsPayoutModalOpen(false);
    }
  };

  const activeBatch = batches.find(b => b.id === activeBatchId) || null;
  const usdcBalanceFormatted = usdcBalance !== undefined
    ? Number(formatUnits(usdcBalance, 6))
    : 0;

  if (!mounted) {
    return (
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Payroll"
            title="Payroll Batches"
            description="Syncing payroll configuration..."
          />
          <Card className="glass-card-component bg-[#060f24]/30 animate-pulse h-96" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="relative space-y-6">
        {/* Ambient background glows */}
        <div className="orb orb-1 opacity-40" />
        <div className="orb orb-3 opacity-30" />

        <div className="relative z-10">
          <PageHeader
            eyebrow="Payroll"
            title="Payroll runs"
            description="Generate payroll batches, calculate monthly payouts, review rosters, and execute direct USDC disbursements."
          />
        </div>

        {storageError && (
          <div className="relative z-10 flex gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold">Local Storage Corrupted</p>
              <p className="mt-1 text-xs text-amber-300/90 leading-relaxed">
                Workspace payroll configuration is corrupted or invalid. Falling back to empty lists.
              </p>
            </div>
          </div>
        )}

        {/* Form Messages */}
        {error && (
          <div className="relative z-10 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="relative z-10 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <div className="relative z-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          
          {/* Left Panel: Creation & History */}
          <div className="space-y-6">
            
            {/* Monthly Payroll Card */}
            <Card className="glass-card-component">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white">Monthly Payroll</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Generate payroll for monthly contributors.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleGenerateMonthlyBatch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Select Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full rounded-xl bg-[#060f24] border border-white/8 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc] transition-all"
                    >
                      {MONTH_OPTIONS.map((m) => (
                        <option key={m} value={m} className="bg-[#060f24] text-white">
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Processes active contributors paid on a monthly schedule (e.g. 1st or 15th of the month) based on the selected month.
                  </p>
                  <Button type="submit" className="w-full btn-electric whitespace-nowrap gap-2">
                    <Plus className="h-4.5 w-4.5" />
                    Generate Monthly Batch
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Weekly Payroll Card */}
            <Card className="glass-card-component">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white">Weekly Payroll</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Generate payroll for weekly contributors.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleGenerateWeeklyBatch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Select Weekly Period</label>
                    <select
                      value={selectedWeeklyPeriodIndex}
                      onChange={(e) => setSelectedWeeklyPeriodIndex(parseInt(e.target.value))}
                      className="w-full rounded-xl bg-[#060f24] border border-white/8 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc] transition-all"
                    >
                      {weeklyPeriods.map((period, index) => (
                        <option key={index} value={index} className="bg-[#060f24] text-white">
                          {period.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Processes active contributors paid on a weekly schedule (e.g. every Friday) who have a payout due during the selected period.
                  </p>
                  <Button type="submit" className="w-full btn-electric whitespace-nowrap gap-2">
                    <Plus className="h-4.5 w-4.5" />
                    Generate Weekly Batch
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* History Card */}
            <Card className="glass-card-component">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-400">Payroll Run History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {batches.length === 0 ? (
                  <div className="text-center py-12 border border-white/5 rounded-2xl bg-white/[0.01]">
                    <History className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-300">No payroll runs found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Use the generator above to create your first monthly payroll run.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {batches.map((b) => {
                      const isActive = b.id === activeBatchId;
                      return (
                        <div
                          key={b.id}
                          onClick={() => {
                            setActiveBatchId(b.id);
                            setError(null);
                            setSuccess(null);
                          }}
                          className={cn(
                            "flex items-center justify-between border rounded-xl px-4 py-3.5 cursor-pointer transition-all",
                            isActive 
                              ? "border-[#6d5dfc]/40 bg-[#6d5dfc]/10 hover:bg-[#6d5dfc]/12" 
                              : "border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03]"
                          )}
                        >
                          <div className="space-y-1">
                            <p className="font-semibold text-white text-sm">{b.month}</p>
                            <p className="text-xs text-slate-400">
                              {b.recipientsCount} Recipients • {b.totalAmount.toLocaleString()} USDC
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                b.status === "Paid" ? "success" : 
                                b.status === "Partially Paid" ? "warning" :
                                b.status === "Approved" ? "blue" : "secondary"
                              }
                            >
                              {b.status}
                            </Badge>
                            <ArrowRight className={cn(
                              "h-4 w-4 transition-transform",
                              isActive ? "text-[#4f8cff] translate-x-0.5" : "text-slate-600"
                            )} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Panel: Batch Detail & Breakdown */}
          <div className="space-y-6">
            {!activeBatch ? (
              <Card className="glass-card-component flex flex-col items-center justify-center text-center p-12 min-h-[450px]">
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-500 mb-4 animate-pulse">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h3 className="text-md font-semibold text-slate-300">No active run selected</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm">
                  Select a run from the history or generate a new month run to inspect recipient breakdowns, audit totals, and initiate payments.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                
                {/* Review / Payout Workflow Card */}
                <div className="glow-border-shell">
                  <Card className="border-0 bg-[#060f24]/90 p-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-[#4f8cff]" />
                        <div>
                          <CardTitle className="text-base text-white font-semibold">Payroll pipeline review</CardTitle>
                          <CardDescription className="text-xs text-slate-400 mt-1">
                            Approve or disburse payments for {activeBatch.month}.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-1">
                      
                      {/* Workflow Details */}
                      {activeBatch.status === "Draft" && (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-300 leading-relaxed bg-white/5 border border-white/8 rounded-xl p-3.5">
                            This batch is currently in <strong>Draft</strong> state. Verify that all salary details below are correct before submitting it for workspace review.
                          </p>
                          <Button 
                            onClick={() => handleAdvanceStatus(activeBatch.id, "Pending")}
                            className="w-full btn-electric gap-2"
                          >
                            <Play className="h-4 w-4" />
                            Submit Batch for Approval
                          </Button>
                        </div>
                      )}

                      {activeBatch.status === "Pending" && (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-300 leading-relaxed bg-white/5 border border-white/8 rounded-xl p-3.5">
                            This batch is <strong>Pending Approval</strong>. Perform a final audit on salary amounts and wallet addresses.
                          </p>
                          <Button 
                            onClick={() => handleAdvanceStatus(activeBatch.id, "Approved")}
                            className="w-full btn-electric gap-2"
                          >
                            <ShieldCheck className="h-4.5 w-4.5" />
                            Approve Payroll Run
                          </Button>
                        </div>
                      )}

                      {activeBatch.status === "Approved" && (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-300 leading-relaxed bg-white/5 border border-white/8 rounded-xl p-3.5">
                            This batch is **Approved**. You can now trigger the payout execution process to transfer USDC directly to contributor wallets.
                          </p>
                          <Button 
                            onClick={() => setIsPayoutModalOpen(true)}
                            className="w-full btn-electric gap-2"
                          >
                            <Send className="h-4 w-4" />
                            Confirm Payout
                          </Button>
                        </div>
                      )}

                      {(activeBatch.status === "Paid" || activeBatch.status === "Partially Paid") && (
                        <div className={cn(
                          "space-y-3 border rounded-xl p-4",
                          activeBatch.status === "Paid" 
                            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                            : "bg-amber-500/5 border-amber-500/10 text-amber-400"
                        )}>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 shrink-0" />
                            <span className="text-sm font-semibold">
                              {activeBatch.status === "Paid" ? "Payroll Executed Successfully" : "Payroll Executed with Failures"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed mt-1">
                            Disbursement loop completed on {activeBatch.executedAt}. Payouts were signed and sent directly from the connected wallet.
                          </p>
                        </div>
                      )}

                    </CardContent>
                  </Card>
                </div>

                {/* Approval Timeline */}
                <Card className="glass-card-component">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-white">Approval timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                    
                    {/* Step 1: Draft */}
                    <div className="relative flex gap-3 text-xs">
                      <div className="absolute -left-5 mt-0.5 h-3 w-3 rounded-full border border-[#6d5dfc] bg-[#6d5dfc]/20 flex items-center justify-center shadow-[0_0_8px_rgba(109,93,252,0.4)]" />
                      <div className="space-y-1">
                        <p className="font-semibold text-white">Batch Compiled (Draft)</p>
                        <p className="text-[10px] text-slate-400">Roster snapshot locked</p>
                        <p className="text-[10px] text-[#4f8cff] font-mono">{activeBatch.createdAt}</p>
                      </div>
                    </div>

                    {/* Step 2: Submitted */}
                    <div className="relative flex gap-3 text-xs">
                      {activeBatch.submittedAt ? (
                        <>
                          <div className="absolute -left-5 mt-0.5 h-3 w-3 rounded-full border border-[#6d5dfc] bg-[#6d5dfc]/20 flex items-center justify-center shadow-[0_0_8px_rgba(109,93,252,0.4)]" />
                          <div className="space-y-1">
                            <p className="font-semibold text-white">Submitted for Review</p>
                            <p className="text-[10px] text-slate-400">Roster sent to workspace owner</p>
                            <p className="text-[10px] text-[#4f8cff] font-mono">{activeBatch.submittedAt}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="absolute -left-5 mt-0.5 h-3 w-3 rounded-full border border-white/10 bg-slate-900" />
                          <div className="space-y-1 opacity-45">
                            <p className="font-semibold text-slate-400">Submitted for Review</p>
                            <p className="text-[10px] text-slate-500">Awaiting founder submission</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Step 3: Approved */}
                    <div className="relative flex gap-3 text-xs">
                      {activeBatch.approvedAt ? (
                        <>
                          <div className="absolute -left-5 mt-0.5 h-3 w-3 rounded-full border border-emerald-500 bg-emerald-500/20 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                          <div className="space-y-1">
                            <p className="font-semibold text-emerald-400">Roster Approved</p>
                            <p className="text-[10px] text-slate-400">Ready for wallet payout stage</p>
                            <p className="text-[10px] text-emerald-400 font-mono">{activeBatch.approvedAt}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="absolute -left-5 mt-0.5 h-3 w-3 rounded-full border border-white/10 bg-slate-900" />
                          <div className="space-y-1 opacity-45">
                            <p className="font-semibold text-slate-400">Roster Approved</p>
                            <p className="text-[10px] text-slate-500">Pending final authorization</p>
                          </div>
                        </>
                      )}
                    </div>

                  </CardContent>
                </Card>

                {/* Batch breakdown table */}
                <Card className="glass-card-component">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-white">Contributor breakdown</CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Roster configuration snapshot for {activeBatch.month}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="overflow-x-auto">
                      <div className="min-w-[500px] space-y-1.5">
                        
                        {/* Headers */}
                        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr] bg-white/5 px-4 py-2 text-xs font-semibold text-slate-400 rounded-lg">
                          <span>CONTRIBUTOR / ROLE</span>
                          <span>WALLET</span>
                          <span>STATUS</span>
                          <span className="text-right">SALARY AMOUNT</span>
                        </div>

                        {/* Rows */}
                        {activeBatch.contributors.map(c => (
                          <div 
                            key={c.id} 
                            className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr] items-center border border-white/5 px-4 py-2.5 text-xs text-slate-300 rounded-lg"
                          >
                            <div className="truncate pr-2">
                              <p className="font-semibold text-white truncate">{c.fullName}</p>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.role}</p>
                              {c.frequency && c.scheduledDate && (
                                <p className="text-[9px] text-[#4f8cff] truncate mt-0.5 font-medium">
                                  {c.frequency} (Due {c.scheduledDate})
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1.5 font-mono text-slate-400">
                              <span>{shortenAddress(c.walletAddress)}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-1 hover:bg-white/10"
                                onClick={() => handleCopy(c.id, c.walletAddress)}
                                title="Copy address"
                              >
                                {copiedId === c.id ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3 text-slate-500" />
                                )}
                              </Button>
                            </div>

                            <div>
                              {c.status === "Paid" && c.txHash ? (
                                <a 
                                  href={`https://testnet.arcscan.app/tx/${c.txHash}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 flex items-center gap-1 hover:underline font-semibold"
                                >
                                  Mined
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              ) : c.status === "Failed" ? (
                                <span className="text-rose-400 font-semibold" title={c.errorMsg}>Failed</span>
                              ) : c.status === "Pending" ? (
                                <span className="text-amber-400 font-semibold flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Mining
                                </span>
                              ) : (
                                <span className="text-slate-500">Unpaid</span>
                              )}
                            </div>

                            <div className="text-right font-semibold text-white">
                              {c.salaryAmount.toLocaleString()} USDC
                            </div>
                          </div>
                        ))}

                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}
          </div>

        </div>

        {/* Payout Execution & Review Modal */}
        {isPayoutModalOpen && activeBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer animate-fade-in"
              onClick={() => !isExecuting && setIsPayoutModalOpen(false)}
            />
            
            {/* Modal Card */}
            <div className="w-full max-w-xl relative z-10 rounded-2xl border border-white/12 bg-[#060f24]/95 backdrop-blur-xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6d5dfc] via-[#6d5dfc] to-[#4f8cff]" />
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Confirm Payroll Payouts</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct USDC transfers from founder wallet to contributors on Arc Testnet.
                  </p>
                </div>
                {!isExecuting && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 hover:bg-white/10" 
                    onClick={() => setIsPayoutModalOpen(false)}
                  >
                    <X className="h-4.5 w-4.5 text-slate-400" />
                  </Button>
                )}
              </div>

              {payoutError && (
                <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex gap-2">
                  <AlertOctagon className="h-4.5 w-4.5 shrink-0 text-rose-400 mt-0.5" />
                  <span>{payoutError}</span>
                </div>
              )}

              {/* Founder wallet balance info */}
              <div className="mb-4 rounded-xl border border-white/8 bg-white/5 p-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">FOUNDER WALLET BALANCE</p>
                  <p className={cn(
                    "font-bold mt-1",
                    isConnected ? "gradient-text inline-block" : "text-white"
                  )}>
                    {!isConnected 
                      ? "Wallet Disconnected" 
                      : `${usdcBalanceFormatted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">TOTAL PAYROLL AMOUNT</p>
                  <p className="font-bold gradient-text inline-block mt-1">
                    {activeBatch.totalAmount.toLocaleString()} USDC
                  </p>
                </div>
              </div>

              {/* Warning for insufficient balance */}
              {isConnected && usdcBalance !== undefined && usdcBalanceFormatted < activeBatch.totalAmount && (
                <div className="mb-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Warning:</strong> Your USDC balance is less than the total payroll amount. Transactions might revert due to insufficient funds. Visit the Faucet to claim test tokens.
                  </p>
                </div>
              )}

              {/* Recipient Roster inside Modal */}
              <div className="max-h-[200px] overflow-y-auto border border-white/5 rounded-xl pr-1 space-y-1.5 p-2 bg-black/20">
                <div className="grid grid-cols-[1.5fr_1.5fr_1fr] px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                  <span>RECIPIENT</span>
                  <span>WALLET ADDRESS</span>
                  <span className="text-right">SALARY</span>
                </div>
                {activeBatch.contributors.map((c, index) => {
                  const isCurrent = currentExecutionIndex === index;
                  return (
                    <div 
                      key={c.id} 
                      className={cn(
                        "grid grid-cols-[1.5fr_1.5fr_1fr] items-center px-3 py-2 text-xs border border-transparent rounded-lg transition-all",
                        isCurrent ? "bg-[#6d5dfc]/10 border-[#6d5dfc]/20" : "bg-white/[0.01]"
                      )}
                    >
                      <div className="truncate pr-1">
                        <p className="font-semibold text-white truncate">{c.fullName}</p>
                        {c.frequency && c.scheduledDate ? (
                          <p className="text-[9px] text-[#4f8cff] truncate mt-0.5 font-medium">
                            {c.frequency} (Due {c.scheduledDate})
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 truncate">{c.role}</p>
                        )}
                      </div>
                      <span className="font-mono text-slate-400 text-[10px]">
                        {shortenAddress(c.walletAddress)}
                      </span>
                      <div className="text-right flex items-center justify-end gap-1.5 font-semibold text-white">
                        <span>{c.salaryAmount.toLocaleString()} USDC</span>
                        {c.status === "Paid" && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        )}
                        {c.status === "Failed" && (
                          <span title={c.errorMsg} className="shrink-0">
                            <AlertOctagon className="h-4 w-4 text-rose-400" />
                          </span>
                        )}
                        {c.status === "Pending" && (
                          <Loader2 className="h-4 w-4 text-amber-400 animate-spin shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                {!isConnected ? (
                  <div className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 w-full text-center">
                    Please connect your founder wallet in the header navigation to execute payouts.
                  </div>
                ) : !isArcTestnet ? (
                  <div className="flex flex-col gap-3 w-full">
                    <div className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 text-center">
                      Unsupported network connected. Arc Payroll only supports Arc Testnet. Please switch networks to execute payouts.
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsPayoutModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={switchToArcTestnet}
                        disabled={isSwitching}
                        className="btn-electric"
                      >
                        {isSwitching ? "Switching..." : "Switch to Arc Testnet"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {!isExecuting ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsPayoutModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleExecutePayout}
                          className="btn-electric gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Confirm & Execute Payouts
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Loader2 className="h-4 w-4 animate-spin text-[#4f8cff]" />
                        <span>
                          Executing payouts sequentially ({currentExecutionIndex + 1} of {activeBatch.contributors.length}). Do not close...
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
