import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE = process.env.API_URL || "http://localhost:5000";

export async function GET() {
  try {
    const { data } = await axios.get(`${API_BASE}/api/portfolio`, {
      timeout: 30000,
    });
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch portfolio";
    return NextResponse.json(
      { status: "error", message, data: null },
      { status: 500 }
    );
  }
}
