"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { StockData, PortfolioResponse } from "@/types/Stock";

const REFRESH_INTERVAL = 15_000; // 15 seconds

export function usePortfolio() {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
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

  useEffect(() => {
    load(true);

    intervalRef.current = setInterval(() => load(false), REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [load]);

  const refresh = useCallback(() => load(false), [load]);

  return { data, loading, error, lastUpdated, refresh };
}
