import { NextResponse } from "next/server";
import { buildAdvice } from "@/lib/advisor";
import { callToolData } from "@/lib/mcd-mcp";
import type {
  AccountInfo,
  LotteryInfo,
  MallProduct,
  PortfolioResponse,
} from "@/lib/types";

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && "list" in value) {
    const list = (value as { list?: unknown }).list;
    return Array.isArray(list) ? (list as T[]) : [];
  }
  if (value && typeof value === "object" && "items" in value) {
    const items = (value as { items?: unknown }).items;
    return Array.isArray(items) ? (items as T[]) : [];
  }
  return [];
}

export async function GET() {
  try {
    const [account, productsRaw, lottery] = await Promise.all([
      callToolData<AccountInfo>("query-my-account"),
      callToolData<MallProduct[] | { list?: MallProduct[] }>(
        "mall-points-products",
        { catRuleIds: "1>4" },
      ),
      callToolData<LotteryInfo>("query-lottery-info").catch(() => null),
    ]);

    const products = asArray<MallProduct>(productsRaw);
    const advice = buildAdvice(account, products, lottery);

    const body: PortfolioResponse = {
      account,
      advice,
      lottery,
      catalogCount: products.length,
    };

    return NextResponse.json(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
