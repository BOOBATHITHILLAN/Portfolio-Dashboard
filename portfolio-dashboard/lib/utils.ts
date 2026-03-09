import type { StockData, SectorSummary } from "@/types/Stock";

export function groupBySector(stocks: StockData[]): SectorSummary[] {
  const sectorMap = new Map<string, StockData[]>();

  for (const stock of stocks) {
    const sector = stock.sector || "Other";
    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, []);
    }
    sectorMap.get(sector)!.push(stock);
  }

  return Array.from(sectorMap.entries()).map(([sector, sectorStocks]) => {
    const totalInvestment = sectorStocks.reduce(
      (sum, s) => sum + s.investment,
      0
    );
    const totalPresentValue = sectorStocks.reduce(
      (sum, s) => sum + s.presentValue,
      0
    );

    return {
      sector,
      totalInvestment,
      totalPresentValue,
      gainLoss: totalPresentValue - totalInvestment,
      stocks: sectorStocks,
    };
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_000).toFixed(2)}Cr`;
  }
  if (abs >= 1_00_000) {
    return `${sign}₹${(abs / 1_00_000).toFixed(2)}L`;
  }
  if (abs >= 1_000) {
    return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}
