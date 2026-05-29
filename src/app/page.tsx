"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Coins,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatEther,
  formatUnits,
  isAddress,
  parseEther,
} from "viem";
import {
  useAccount,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { CROWDFUNDING_ABI, CROWDFUNDING_ADDRESS } from "@/constants";

const crowdfundingContract = {
  address: CROWDFUNDING_ADDRESS,
  abi: CROWDFUNDING_ABI,
} as const;

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function formatUsd(value: bigint | undefined) {
  if (value === undefined) {
    return "—";
  }

  const amount = Number(formatUnits(value, 18));
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function getCountdown(deadline: bigint | undefined): CountdownState {
  if (!deadline) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
  }

  const remaining = Number(deadline) - Math.floor(Date.now() / 1000);

  if (remaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(remaining / 86_400),
    hours: Math.floor((remaining % 86_400) / 3_600),
    minutes: Math.floor((remaining % 3_600) / 60),
    seconds: remaining % 60,
    expired: false,
  };
}

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  if (!toast) {
    return null;
  }

  const isSuccess = toast.type === "success";

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50">
      <div
        className={`toast-enter pointer-events-auto flex min-w-[280px] items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${
          isSuccess
            ? "border-emerald-500/30 bg-emerald-950/90 text-emerald-50"
            : "border-rose-500/30 bg-rose-950/90 text-rose-50"
        }`}
      >
        <div className="flex-1 text-sm font-medium">{toast.message}</div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm opacity-70 transition hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function CountdownUnit({ label, value }: { label: string; value: number }) {
  return (
    <div className="countdown-box flex min-w-[72px] flex-col items-center rounded-2xl px-4 py-3">
      <span className="text-2xl font-semibold tabular-nums">{String(value).padStart(2, "0")}</span>
      <span className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{label}</span>
    </div>
  );
}

export default function Home() {
  const queryClient = useQueryClient();
  const { address, isConnected, chain } = useAccount();

  const [ethAmount, setEthAmount] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  const {
    data: contractData,
    isLoading: isContractLoading,
    refetch: refetchContract,
  } = useReadContracts({
    contracts: [
      {
        ...crowdfundingContract,
        functionName: "getFundingGoalUsd",
      },
      {
        ...crowdfundingContract,
        functionName: "getTotalUsdRaised",
      },
      {
        ...crowdfundingContract,
        functionName: "getDeadline",
      },
      {
        ...crowdfundingContract,
        functionName: "getOwner",
      },
      {
        ...crowdfundingContract,
        functionName: "getMinimumUsdContribution",
      },
      {
        ...crowdfundingContract,
        functionName: "getAddressToAmountFunded",
        args: [address ?? "0x0000000000000000000000000000000000000000"],
      },
    ],
    query: {
      enabled: isAddress(CROWDFUNDING_ADDRESS),
      refetchInterval: 12_000,
    },
  });

  const fundingGoalUsd = contractData?.[0]?.result;
  const totalUsdRaised = contractData?.[1]?.result;
  const deadline = contractData?.[2]?.result;
  const owner = contractData?.[3]?.result;
  const minimumUsdContribution = contractData?.[4]?.result;
  const userContribution = contractData?.[5]?.result;

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isTxSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isOwner = useMemo(() => {
    if (!address || !owner) {
      return false;
    }

    return address.toLowerCase() === owner.toLowerCase();
  }, [address, owner]);

  const progressPercent = useMemo(() => {
    if (!fundingGoalUsd || fundingGoalUsd === 0n || totalUsdRaised === undefined) {
      return 0;
    }

    const percent = Number((totalUsdRaised * 10000n) / fundingGoalUsd) / 100;
    return Math.min(percent, 100);
  }, [fundingGoalUsd, totalUsdRaised]);

  const goalMet = useMemo(() => {
    if (!fundingGoalUsd || totalUsdRaised === undefined) {
      return false;
    }

    return totalUsdRaised >= fundingGoalUsd;
  }, [fundingGoalUsd, totalUsdRaised]);

  const deadlinePassed = countdown.expired;
  const canFund = isConnected && !deadlinePassed && chain?.id === 11_155_111;
  const canWithdraw = isOwner && deadlinePassed && goalMet;
  const canRefund =
    isConnected &&
    deadlinePassed &&
    !goalMet &&
    userContribution !== undefined &&
    userContribution > 0n;

  const isBusy = isWritePending || isConfirming;

  const dismissToast = useCallback(() => setToast(null), []);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    setCountdown(getCountdown(deadline));

    const interval = window.setInterval(() => {
      setCountdown(getCountdown(deadline));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [deadline]);

  useEffect(() => {
    if (!isTxSuccess) {
      return;
    }

    void refetchContract();
    void queryClient.invalidateQueries();
    showToast("Transaction confirmed successfully.", "success");
    resetWrite();
    setEthAmount("");
  }, [isTxSuccess, queryClient, refetchContract, resetWrite, showToast]);

  useEffect(() => {
    if (writeError) {
      showToast(writeError.message, "error");
    }
  }, [writeError, showToast]);

  useEffect(() => {
    if (receiptError) {
      showToast(receiptError.message, "error");
    }
  }, [receiptError, showToast]);

  const handleFund = () => {
    if (!canFund) {
      showToast("Connect your wallet on Sepolia to fund the campaign.", "error");
      return;
    }

    if (!ethAmount || Number(ethAmount) <= 0) {
      showToast("Enter a valid ETH amount.", "error");
      return;
    }

    writeContract({
      ...crowdfundingContract,
      functionName: "fund",
      value: parseEther(ethAmount),
    });
  };

  const handleWithdraw = () => {
    writeContract({
      ...crowdfundingContract,
      functionName: "withdraw",
    });
  };

  const handleRefund = () => {
    writeContract({
      ...crowdfundingContract,
      functionName: "getRefund",
    });
  };

  return (
    <div className="min-h-screen">
      <Toast toast={toast} onDismiss={dismissToast} />

      <header className="border-b border-white/10 bg-slate-950/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
                Sepolia
              </p>
              <h1 className="text-xl font-semibold text-white">Crowdfunding DApp</h1>
            </div>
          </div>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-8">
          <p className="max-w-2xl text-slate-300">
            Back real-world ideas with ETH. Contributions are valued in USD through
            Chainlink, and funds settle automatically after the campaign deadline.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="glass-card rounded-3xl p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-500/15 p-3 text-indigo-300">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Campaign Progress</h2>
                  <p className="text-sm text-slate-400">Live on-chain funding metrics</p>
                </div>
              </div>
              <div className="rounded-full bg-indigo-500/15 px-3 py-1 text-sm font-medium text-indigo-200">
                {isContractLoading ? "Loading..." : `${progressPercent.toFixed(1)}% funded`}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-sm text-slate-400">Campaign Target</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {formatUsd(fundingGoalUsd)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-sm text-slate-400">Total Raised</p>
                <p className="mt-2 text-3xl font-semibold text-cyan-300">
                  {formatUsd(totalUsdRaised)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Funding progress
                </span>
                <span>
                  {formatUsd(totalUsdRaised)} / {formatUsd(fundingGoalUsd)}
                </span>
              </div>
              <div className="progress-track h-4 overflow-hidden rounded-full">
                <div
                  className="progress-fill h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                Minimum contribution:{" "}
                <span className="font-medium text-white">
                  {formatUsd(minimumUsdContribution)}
                </span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                Your contribution:{" "}
                <span className="font-medium text-white">
                  {userContribution ? `${formatEther(userContribution)} ETH` : "0 ETH"}
                </span>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-3xl p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-300">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Time Remaining</h2>
                <p className="text-sm text-slate-400">
                  {deadlinePassed ? "Campaign ended" : "Until funding closes"}
                </p>
              </div>
            </div>

            {deadlinePassed ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-6 text-center text-amber-100">
                The campaign deadline has passed.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <CountdownUnit label="Days" value={countdown.days} />
                <CountdownUnit label="Hours" value={countdown.hours} />
                <CountdownUnit label="Mins" value={countdown.minutes} />
                <CountdownUnit label="Secs" value={countdown.seconds} />
              </div>
            )}
          </section>

          <section className="glass-card rounded-3xl p-6 lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Fund Campaign</h2>
                <p className="text-sm text-slate-400">
                  Send ETH to support this campaign before the deadline
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="number"
                min="0"
                step="0.001"
                placeholder="Amount in ETH"
                value={ethAmount}
                onChange={(event) => setEthAmount(event.target.value)}
                disabled={!canFund || isBusy}
                className="input-field w-full rounded-2xl px-4 py-3 text-white placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={handleFund}
                disabled={!canFund || isBusy}
                className="btn-primary rounded-2xl px-6 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBusy ? "Processing..." : "Fund Campaign"}
              </button>
            </div>

            {!isConnected && (
              <p className="mt-3 text-sm text-slate-400">
                Connect your wallet to contribute.
              </p>
            )}
            {isConnected && chain?.id !== 11_155_111 && (
              <p className="mt-3 text-sm text-amber-300">
                Switch to Sepolia to interact with this campaign.
              </p>
            )}
          </section>

          <section className="glass-card rounded-3xl p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-violet-500/15 p-3 text-violet-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
                <p className="text-sm text-slate-400">Owner and contributor actions</p>
              </div>
            </div>

            {isContractLoading ? (
              <p className="text-sm text-slate-400">Loading campaign permissions...</p>
            ) : isOwner ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  You are the campaign owner.
                </div>
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={!canWithdraw || isBusy}
                  className="btn-primary w-full rounded-2xl px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBusy ? "Processing..." : "Withdraw Funds"}
                </button>
                {!canWithdraw && (
                  <p className="text-sm text-slate-400">
                    Withdraw unlocks after the deadline once the funding target is met.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                  Owner:{" "}
                  <span className="font-mono text-xs text-slate-200">
                    {owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : "—"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRefund}
                  disabled={!canRefund || isBusy}
                  className="btn-secondary w-full rounded-2xl px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBusy ? "Processing..." : "Claim Refund"}
                </button>
                {!canRefund && (
                  <p className="text-sm text-slate-400">
                    Refunds are available after the deadline if the campaign did not reach
                    its target and you have contributed.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
