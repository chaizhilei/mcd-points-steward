import { NextResponse } from "next/server";
import { callTool, callToolData } from "@/lib/mcd-mcp";
import type { LotteryInfo } from "@/lib/types";

type DrawBody = {
  confirm?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DrawBody;

    if (!body.confirm) {
      return NextResponse.json(
        { error: "请先确认抽奖（confirm: true）" },
        { status: 400 },
      );
    }

    const lottery = await callToolData<LotteryInfo>("query-lottery-info");
    if (!lottery?.drawDecision?.resourceEligible) {
      return NextResponse.json(
        { error: "当前不满足抽奖资源条件，请刷新后重试" },
        { status: 400 },
      );
    }

    const data = await callTool("draw-lottery");
    return NextResponse.json({ ok: true, data, lotteryPreview: lottery });
  } catch (error) {
    const message = error instanceof Error ? error.message : "抽奖失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
