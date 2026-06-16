"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  UserRoundCheck, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  Check, 
  Copy, 
  ExternalLink,
  X,
  DollarSign,
  AlertTriangle
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shortenAddress } from "@/components/wallet/use-arc-wallet";

type Contributor = {
  id: string;
  fullName: string;
  walletAddress: string;
  role: string;
  salaryAmount: number;
  status: "Active" | "Suspended";
  startDate: string;
  frequency: "Weekly" | "Monthly";
  payoutDay: number | string;
};

const DEFAULT_CONTRIBUTORS: Contributor[] = [
  {
    id: "c-1",
    fullName: "Maya Chen",
    walletAddress: "0x7a8df39c1234567890abcdef1234567890abcdef",
    role: "Lead Protocol Engineer",
    salaryAmount: 6500,
    status: "Active",
    startDate: "2026-06-01",
    frequency: "Monthly",
    payoutDay: 1,
  },
  {
    id: "c-2",
    fullName: "Luis Park",
    walletAddress: "0xbc8a892b1234567890abcdef1234567890abcdef",
    role: "Frontend Engineer",
    salaryAmount: 4800,
    status: "Active",
    startDate: "2026-06-01",
    frequency: "Monthly",
    payoutDay: 15,
  },
  {
    id: "c-3",
    fullName: "Ari James",
    walletAddress: "0x4e23761a1234567890abcdef1234567890abcdef",
    role: "Product Designer",
    salaryAmount: 5200,
    status: "Active",
    startDate: "2026-06-01",
    frequency: "Weekly",
    payoutDay: "Friday",
  },
  {
    id: "c-4",
    fullName: "Nora Singh",
    walletAddress: "0x9f1a238b1234567890abcdef1234567890abcdef",
    role: "DevOps Engineer",
    salaryAmount: 5800,
    status: "Suspended",
    startDate: "2026-06-01",
    frequency: "Monthly",
    payoutDay: 1,
  },
];

const initialForm = {
  fullName: "",
  walletAddress: "",
  role: "",
  salaryAmount: 0,
  status: "Active" as "Active" | "Suspended",
  startDate: new Date().toISOString().split("T")[0],
  frequency: "Monthly" as "Weekly" | "Monthly",
  payoutDay: 1 as number | string,
};

export default function ContributorsPage() {
  const [mounted, setMounted] = useState(false);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [storageError, setStorageError] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContributorId, setEditingContributorId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Delete confirm states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Clipboard copied states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("arc_contributors");
    if (stored) {
      try {
        setContributors(JSON.parse(stored));
      } catch {
        setContributors([]);
        setStorageError(true);
      }
    } else {
      setContributors(DEFAULT_CONTRIBUTORS);
      localStorage.setItem("arc_contributors", JSON.stringify(DEFAULT_CONTRIBUTORS));
    }
  }, []);

  const saveRoster = (newRoster: Contributor[]) => {
    setContributors(newRoster);
    localStorage.setItem("arc_contributors", JSON.stringify(newRoster));
  };

  const handleCopy = (id: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddModal = () => {
    setFormData(initialForm);
    setEditingContributorId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contributor: Contributor) => {
    setFormData({
      fullName: contributor.fullName,
      walletAddress: contributor.walletAddress,
      role: contributor.role,
      salaryAmount: contributor.salaryAmount,
      status: contributor.status,
      startDate: contributor.startDate || new Date().toISOString().split("T")[0],
      frequency: contributor.frequency || "Monthly",
      payoutDay: contributor.payoutDay !== undefined ? contributor.payoutDay : 1,
    });
    setEditingContributorId(contributor.id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContributorId(null);
    setFormError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const { fullName, walletAddress, role, salaryAmount, status, startDate, frequency, payoutDay } = formData;

    // Simple validations
    if (!fullName.trim() || !role.trim()) {
      setFormError("Full Name and Role fields are required.");
      return;
    }

    if (salaryAmount <= 0) {
      setFormError("Salary amount must be a positive number.");
      return;
    }

    if (!startDate) {
      setFormError("Start date is required.");
      return;
    }

    // EVM Address Validation
    const cleanAddress = walletAddress.trim();
    const isAddressValid = /^0x[a-fA-F0-9]{40}$/.test(cleanAddress);
    if (!isAddressValid) {
      setFormError("Please enter a valid wallet address (0x followed by 40 hex characters).");
      return;
    }

    // Duplicate Address check
    const isDuplicate = contributors.some(c => 
      c.id !== editingContributorId && 
      c.walletAddress.toLowerCase() === cleanAddress.toLowerCase()
    );

    if (isDuplicate) {
      setFormError("This wallet address is already assigned to another contributor.");
      return;
    }

    if (editingContributorId) {
      // Edit mode
      const updated = contributors.map(c => 
        c.id === editingContributorId 
          ? { 
              ...c, 
              fullName, 
              walletAddress: cleanAddress, 
              role, 
              salaryAmount, 
              status, 
              startDate, 
              frequency, 
              payoutDay 
            }
          : c
      );
      saveRoster(updated);
    } else {
      // Add mode
      const newContributor: Contributor = {
        id: `c-${Date.now()}`,
        fullName,
        walletAddress: cleanAddress,
        role,
        salaryAmount,
        status,
        startDate,
        frequency,
        payoutDay,
      };
      saveRoster([...contributors, newContributor]);
    }

    handleCloseModal();
  };

  const handleConfirmDelete = (id: string) => {
    const updated = contributors.filter(c => c.id !== id);
    saveRoster(updated);
    setDeleteConfirmId(null);
  };

  const filteredContributors = contributors.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(query) ||
      c.role.toLowerCase().includes(query) ||
      c.walletAddress.toLowerCase().includes(query)
    );
  });

  if (!mounted) {
    return (
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Contributors"
            title="Workspace Roster"
            description="Syncing workspace contributor parameters..."
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
        <div className="orb orb-2 opacity-30" />

        <div className="relative z-10">
          <PageHeader
            eyebrow="Contributors"
            title="Workspace Roster"
            description="Manage contributor profiles, wallet addresses, and monthly compensations. Setup direct payroll pipelines."
            action={
              <Button onClick={handleOpenAddModal} className="btn-electric gap-2">
                <Plus className="h-4.5 w-4.5" />
                Add Contributor
              </Button>
            }
          />
        </div>

        {storageError && (
          <div className="relative z-10 flex gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold">Local Storage Corrupted</p>
              <p className="mt-1 text-xs text-amber-300/90 leading-relaxed">
                Workspace roster data is corrupted or invalid. Falling back to an empty team roster.
              </p>
            </div>
          </div>
        )}

        {/* Directory Card */}
        <Card className="relative z-10 glass-card-component">
          <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between md:space-y-0 pb-4">
            <CardTitle>Team roster</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search contributors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/8 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc] transition-all"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {filteredContributors.length === 0 ? (
              <div className="text-center py-12 border border-white/5 rounded-2xl bg-white/[0.01]">
                <UserRoundCheck className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300">No contributors found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Try adjusting your search criteria or add a new team member to the directory.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[750px] space-y-2">
                  {/* Table Headers */}
                  <div className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr_0.7fr] bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-400 rounded-lg">
                    <span>CONTRIBUTOR / ROLE</span>
                    <span>WALLET ADDRESS</span>
                    <span>MONTHLY COMP</span>
                    <span>STATUS</span>
                    <span className="text-right">ACTIONS</span>
                  </div>

                  {/* Roster Rows */}
                  {filteredContributors.map((c) => (
                    <div 
                      key={c.id} 
                      className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr_0.7fr] items-center border border-white/5 px-4 py-3.5 text-sm text-white hover:bg-white/[0.02] rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6d5dfc]/10 border border-[#6d5dfc]/15 text-[#4f8cff] shrink-0">
                          <UserRoundCheck className="h-4.5 w-4.5" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-white truncate">{c.fullName}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{c.role}</p>
                          <p className="text-[10px] text-[#4f8cff] mt-0.5 font-medium">
                            Starts {c.startDate || "2026-06-01"} · {c.frequency === "Weekly" ? `Weekly on ${c.payoutDay}` : `Monthly on Day ${c.payoutDay}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-300">{shortenAddress(c.walletAddress)}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 hover:bg-white/10"
                            onClick={() => handleCopy(c.id, c.walletAddress)}
                            title="Copy address"
                          >
                            {copiedId === c.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-slate-500" />
                            )}
                          </Button>
                          <a
                            href={`https://testnet.arcscan.app/address/${c.walletAddress}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 hover:bg-white/10"
                              title="View on ArcScan"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                          </a>
                        </div>
                      </div>

                      <div className="font-semibold text-white flex items-center gap-0.5">
                        <DollarSign className="h-4 w-4 text-emerald-400 shrink-0" />
                        {c.salaryAmount.toLocaleString()} / mo
                      </div>

                      <div>
                        <Badge variant={c.status === "Active" ? "success" : "warning"}>
                          {c.status}
                        </Badge>
                      </div>

                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-white/10 text-slate-400 hover:text-white"
                          onClick={() => handleOpenEditModal(c)}
                          title="Edit contributor"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                          onClick={() => setDeleteConfirmId(c.id)}
                          title="Remove contributor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custom Edit/Add Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
              onClick={handleCloseModal}
            />
            
            {/* Modal Card */}
            <div className="w-full max-w-md relative z-10 rounded-2xl border border-white/12 bg-[#060f24]/95 backdrop-blur-xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6d5dfc] via-[#6d5dfc] to-[#4f8cff]" />
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingContributorId ? "Edit Contributor" : "Add Contributor"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure profile data, payment credentials, and compensation.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 hover:bg-white/10" 
                  onClick={handleCloseModal}
                >
                  <X className="h-4.5 w-4.5 text-slate-400" />
                </Button>
              </div>

              {formError && (
                <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-400 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">FULL NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Chen"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">WALLET ADDRESS</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0x..."
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc] transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">ROLE / DESIGNATION</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Developer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">SALARY (USD / MO)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 5000"
                      value={formData.salaryAmount || ""}
                      onChange={(e) => setFormData({ ...formData, salaryAmount: Number(e.target.value) })}
                      className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">STATUS</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Suspended" })}
                      className="w-full rounded-xl bg-[#060f24] border border-white/8 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc] transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">START DATE</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-xl bg-white/5 border border-white/8 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">PAYOUT FREQUENCY</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => {
                        const freq = e.target.value as "Weekly" | "Monthly";
                        setFormData({ 
                          ...formData, 
                          frequency: freq,
                          payoutDay: freq === "Weekly" ? "Friday" : 1 
                        });
                      }}
                      className="w-full rounded-xl bg-[#060f24] border border-white/8 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc] transition-all"
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      {formData.frequency === "Weekly" ? "WEEKDAY" : "DAY OF MONTH"}
                    </label>
                    {formData.frequency === "Weekly" ? (
                      <select
                        value={formData.payoutDay}
                        onChange={(e) => setFormData({ ...formData, payoutDay: e.target.value })}
                        className="w-full rounded-xl bg-[#060f24] border border-white/8 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc] transition-all"
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    ) : (
                      <select
                        value={formData.payoutDay}
                        onChange={(e) => setFormData({ ...formData, payoutDay: Number(e.target.value) })}
                        className="w-full rounded-xl bg-[#060f24] border border-white/8 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6d5dfc] focus:ring-1 focus:ring-[#6d5dfc] transition-all"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <option key={day} value={day}>
                            {day === 1 ? "1st" : day === 2 ? "2nd" : day === 3 ? "3rd" : `${day}th`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="btn-electric"
                  >
                    Save profile
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Warning Overlay */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
              onClick={() => setDeleteConfirmId(null)}
            />
            
            {/* Warning Box */}
            <div className="w-full max-w-sm relative z-10 rounded-2xl border border-rose-500/20 bg-[#060f24]/95 backdrop-blur-xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
              <div className="mb-4 flex gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-semibold text-white">Remove Contributor</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Are you sure you want to remove this profile? This will delete their payroll parameter records.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleConfirmDelete(deleteConfirmId)}
                >
                  Remove Roster
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
