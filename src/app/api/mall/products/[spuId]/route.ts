import { NextResponse } from "next/server";
import { callToolData } from "@/lib/mcd-mcp";
import type { ProductDetail } from "@/lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ spuId: string }> },
) {
  try {
    const { spuId } = await context.params;
    const id = Number.parseInt(spuId, 10);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "无效的 spuId" }, { status: 400 });
    }

    const detail = await callToolData<ProductDetail>("mall-product-detail", {
      spuId: id,
    });

    return NextResponse.json(detail);
  } catch (error) {
    const message = error instanceof Error ? error.message : "查询商品详情失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
