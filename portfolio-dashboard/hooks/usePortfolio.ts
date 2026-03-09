"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { StockData, PortfolioResponse } from "@/types/Stock";

const REFRESH_INTERVAL = 15_000; // 15 seconds

export function usePortfolio() {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/stocks");
      const res: PortfolioResponse = await response.json();

      if (res.status === "success" && res.data) {
        setData(res.data);
        setLastUpdated(new Date());
      } else {
        setError(res.message || "Failed to fetch portfolio data");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to server"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Schedule next auto-refresh AFTER current call completes
  const scheduleNext = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await load();
      if (!cancelledRef.current) scheduleNext();
    }, REFRESH_INTERVAL);
  }, [load]);

  const stopAutoRefresh = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Initial load + start auto-refresh loop
  useEffect(() => {
    cancelledRef.current = false;
    load().then(() => scheduleNext());

    return () => {
      cancelledRef.current = true;
      stopAutoRefresh();
    };
  }, [load, scheduleNext, stopAutoRefresh]);

  // Manual refresh: wait for API response, then restart 15s countdown
  const refresh = useCallback(async () => {
    stopAutoRefresh();
    await load();
    scheduleNext();
  }, [load, scheduleNext, stopAutoRefresh]);

  return { data, loading, error, lastUpdated, refresh };
}
