"use client";

import { useState } from "react";
import type { LotteryInfo } from "@/lib/types";

type Props = {
  lottery: LotteryInfo | null;
  lotteryNote: string | null;
  onDrawn: () => void;
};

function consumptionText(lottery: LotteryInfo): string {
  const next = lottery.drawDecision?.nextConsumption;
  if (lottery.drawPoint != null && lottery.drawPoint !== "") {
    return `${lottery.drawPoint} 积分`;
  }
  if (!next) return "未知";
  if (typeof next === "string") {
    return next.replace(/^本次将消耗\s*/, "");
  }
  if (next.amount != null) {
    const type = String(next.type ?? "POINTS").toUpperCase();
    return type.includes("POINT") ? `${next.amount} 积分` : `${next.amount} 次`;
  }
  if (next.text) {
    return String(next.text).replace(/^本次将消耗\s*/, "");
  }
  return "未知";
}

export function LotteryPanel({ lottery, lotteryNote, onDrawn }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!lottery) {
    return (
      <section id="lottery" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h2 className="section-title">抽奖</h2>
        <p className="mt-4 text-sm text-[var(--mcd-gray)]">暂无抽奖活动信息</p>
      </section>
    );
  }

  const eligible = Boolean(lottery.drawDecision?.resourceEligible);

  async function handleDraw() {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/lottery/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "抽奖失败");
      const win = data?.data?.win ?? data?.data?.structuredContent?.win;
      const prizes =
        data?.data?.prizes ?? data?.data?.structuredContent?.prizes ?? [];
      if (win && Array.isArray(prizes) && prizes.length) {
        setMessage(
          `中奖：${prizes.map((p: { name?: string }) => p.name).join("、")}`,
        );
      } else {
        setMessage("未中奖，积分/次数已按规则扣减");
      }
      setConfirmOpen(false);
      onDrawn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "抽奖失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="lottery" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <h2 className="section-title">抽奖（默认不推荐）</h2>

      <div className="tile mt-5 overflow-hidden">
        <div className="grid md:grid-cols-[1.2fr_1fr]">
          <div className="bg-[linear-gradient(160deg,#ffe9a8_0%,#fff_48%)] px-5 py-6 sm:px-7 sm:py-8">
            <p className="text-xs font-bold text-[var(--mcd-red)]">
              {lottery.activityStatusText ?? "活动"}
            </p>
            <h3 className="mt-2 text-2xl font-extrabold text-[var(--mcd-black)]">
              {lottery.activityName ?? "积分抽奖"}
            </h3>
            <p className="mt-3 text-sm text-[var(--mcd-gray)]">
              {lottery.endTime ? `截止 ${lottery.endTime}` : "进行中"}
            </p>
            <p className="mt-2 text-base font-bold text-[var(--mcd-black)]">
              本次消耗：{consumptionText(lottery)}
            </p>
            {lotteryNote && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--mcd-gray)]">
                {lotteryNote}
              </p>
            )}
          </div>

          <div className="border-t border-[var(--mcd-line)] bg-white px-5 py-6 md:border-l md:border-t-0 sm:px-6">
            <p className="text-sm font-bold text-[var(--mcd-black)]">奖品一览</p>
            {lottery.prizes && lottery.prizes.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {lottery.prizes.slice(0, 5).map((p, i) => (
                  <li
                    key={`${p.name}-${i}`}
                    className="border-b border-[var(--mcd-line)] pb-2 text-sm text-[var(--mcd-gray)] last:border-0"
                  >
                    {p.name}
                    {p.typeText ? ` · ${p.typeText}` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--mcd-gray)]">暂无公开奖品列表</p>
            )}
          </div>
        </div>

        <div className="tile-foot flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-bold">理财官更建议先兑换商品券</span>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!eligible}
              onClick={() => setConfirmOpen(true)}
              className="btn-secondary"
            >
              {eligible ? "仍要抽奖" : "当前不可抽"}
            </button>
            {message && (
              <span className="text-sm font-bold text-[var(--ok)]">{message}</span>
            )}
            {error && (
              <span className="text-sm font-bold text-[var(--mcd-red)]">{error}</span>
            )}
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <div className="w-full max-w-md overflow-hidden bg-white shadow-xl">
            <div className="bg-[var(--mcd-yellow-soft)] px-5 py-4">
              <h3 className="text-lg font-extrabold">二次确认抽奖</h3>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm leading-relaxed text-[var(--mcd-gray)]">
                将消耗：{consumptionText(lottery)}。抽奖结果以官方活动规则为准，默认更推荐先兑换商品券。
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleDraw}
                  className="btn-primary flex-1"
                >
                  {submitting ? "抽奖中…" : "确认抽一次"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
