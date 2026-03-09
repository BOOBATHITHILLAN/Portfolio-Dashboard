import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE = process.env.API_URL || "http://localhost:5000";

// In-memory cache to reduce backend API calls
let cachedData: unknown = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10_000; // 10 seconds

export async function GET() {
  try {
    const now = Date.now();

    // Return cached data if still fresh
    if (cachedData && now - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json(cachedData, {
        headers: { "X-Cache": "HIT" },
      });
    }

    // Fetch fresh data from backend
    const { data } = await axios.get(`${API_BASE}/api/portfolio`, {
      timeout: 30000,
    });

    // Update cache
    cachedData = data;
    cacheTimestamp = now;

    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    // Return stale cache on error if available
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: { "X-Cache": "STALE" },
      });
    }

    const message =
      error instanceof Error ? error.message : "Failed to fetch portfolio";
    return NextResponse.json(
      { status: "error", message, data: null },
      { status: 500 }
    );
  }
}
