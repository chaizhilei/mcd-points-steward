import { NextResponse } from "next/server";
import { callToolData } from "@/lib/mcd-mcp";

type RedeemBody = {
  confirm?: boolean;
  skuId?: number;
  spuCategory?: string;
  count?: number;
  addressId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RedeemBody;

    if (!body.confirm) {
      return NextResponse.json(
        { error: "请先确认兑换（confirm: true）" },
        { status: 400 },
      );
    }

    if (!body.skuId || !body.spuCategory) {
      return NextResponse.json(
        { error: "缺少 skuId 或 spuCategory" },
        { status: 400 },
      );
    }

    if (body.spuCategory === "2" && !body.addressId) {
      return NextResponse.json(
        { error: "实物商品需要 addressId" },
        { status: 400 },
      );
    }

    const data = await callToolData("mall-create-order", {
      skuId: body.skuId,
      spuCategory: body.spuCategory,
      count: body.count ?? 1,
      ...(body.addressId ? { addressId: body.addressId } : {}),
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "兑换失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
