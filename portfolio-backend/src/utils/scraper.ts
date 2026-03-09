import axios from "axios";
import * as cheerio from "cheerio";

export const fetchGoogleMetrics = async (symbol: string) => {
  try {
    let googleSymbol = symbol;
    if (symbol.endsWith(".NS")) {
      googleSymbol = symbol.replace(".NS", ":NSE");
    } else if (symbol.endsWith(".BO")) {
      googleSymbol = symbol.replace(".BO", ":BOM");
    }

    const url = `https://www.google.com/finance/quote/${googleSymbol}`;
    
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(data);
    return {
      peRatio: $(".P6bcWc").first().text() || "N/A",
      earnings: $(".m6669").first().text() || "N/A",
    };
  } catch (err) {
    return { peRatio: "N/A", earnings: "N/A" };
  }
};
