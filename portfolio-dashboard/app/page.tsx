"use client";

import { RefreshCw, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import PortfolioTable from "@/components/PortfolioTable";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";

export default function Home() {
  const { data, loading, error, lastUpdated, refresh } = usePortfolio();

  const totalInvestment = data.reduce((sum, s) => sum + s.investment, 0);
  const totalPresentValue = data.reduce((sum, s) => sum + s.presentValue, 0);
  const totalGainLoss = totalPresentValue - totalInvestment;
  const gainLossPercent =
    totalInvestment > 0
      ? ((totalGainLoss / totalInvestment) * 100).toFixed(2)
      : "0";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-2xl font-bold text-slate-900">
              Portfolio Dashboard
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">
              Real-time stock data from Yahoo Finance & Google Finance
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {lastUpdated && (
              <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg bg-slate-800 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-6 py-4 sm:py-6">
        {/* Summary Cards */}
        {data.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <SummaryCard
              label="Total Investment"
              value={formatCurrency(totalInvestment)}
              compactValue={formatCompactCurrency(totalInvestment)}
            />
            <SummaryCard
              label="Present Value"
              value={formatCurrency(totalPresentValue)}
              compactValue={formatCompactCurrency(totalPresentValue)}
            />
            <SummaryCard
              label="Total Gain/Loss"
              value={formatCurrency(totalGainLoss)}
              compactValue={formatCompactCurrency(totalGainLoss)}
              subValue={`${totalGainLoss >= 0 ? "+" : ""}${gainLossPercent}%`}
              variant={totalGainLoss >= 0 ? "gain" : "loss"}
            />
            <SummaryCard
              label="Holdings"
              value={data.length.toString()}
              compactValue={data.length.toString()}
              subValue="stocks"
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 rounded-lg bg-red-50 border border-red-200 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-700">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Failed to load portfolio data</p>
              <p className="text-[10px] sm:text-xs mt-0.5 truncate">{error}</p>
            </div>
            <button
              onClick={refresh}
              className="ml-auto shrink-0 text-[10px] sm:text-xs font-medium underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-slate-400 mb-3" />
            <p className="text-xs sm:text-sm text-slate-500">
              Loading portfolio data...
            </p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
              Fetching from Yahoo Finance & Google Finance
            </p>
          </div>
        )}

        {/* Table / Cards */}
        {data.length > 0 && <PortfolioTable data={data} />}

        {/* Auto-refresh indicator */}
        {data.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
            {lastUpdated && (
              <span className="text-[10px] text-slate-400 sm:hidden">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <p className="text-[10px] sm:text-xs text-slate-400">
              Auto-refreshes every 15s
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  compactValue,
  subValue,
  variant,
}: {
  label: string;
  value: string;
  compactValue: string;
  subValue?: string;
  variant?: "gain" | "loss";
}) {
  const colorClass =
    variant === "gain"
      ? "text-emerald-600"
      : variant === "loss"
        ? "text-red-600"
        : "text-slate-900";

  return (
    <div className="rounded-lg sm:rounded-xl bg-white border border-slate-200 p-2.5 sm:p-4 shadow-sm">
      <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
        {label}
      </p>
      {/* Compact on mobile, full on desktop */}
      <p className={`text-sm font-bold mt-0.5 sm:hidden tabular-nums ${colorClass}`}>
        {compactValue}
      </p>
      <p className={`text-xl font-bold mt-1 hidden sm:block tabular-nums ${colorClass}`}>
        {value}
      </p>
      {subValue && (
        <p
          className={`text-[10px] sm:text-xs mt-0.5 flex items-center gap-0.5 ${
            variant === "gain"
              ? "text-emerald-500"
              : variant === "loss"
                ? "text-red-500"
                : "text-slate-400"
          }`}
        >
          {variant === "gain" && <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
          {variant === "loss" && <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
          {subValue}
        </p>
      )}
    </div>
  );
}
