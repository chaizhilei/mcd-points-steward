"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdviceRecommendation, PortfolioResponse } from "@/lib/types";
import { AdvicePanel } from "./AdvicePanel";
import { LotteryPanel } from "./LotteryPanel";
import { RedeemConfirm } from "./RedeemConfirm";
import { RedeemList } from "./RedeemList";
import { RiskHero } from "./RiskHero";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function Dashboard() {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeemTarget, setRedeemTarget] = useState<AdviceRecommendation | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "加载失败");
      setData(json as PortfolioResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-[var(--mcd-gray)]">
          <span className="logo-m inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--mcd-yellow)] text-2xl font-black text-[var(--mcd-red)]">
            M
          </span>
          <p className="font-bold">正在盘点你的积分资产…</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <p className="font-bold text-[var(--mcd-red)]">{error}</p>
          <p className="mt-3 text-sm text-[var(--mcd-gray)]">
            请确认已在 .env.local 配置有效的 MCD_MCP_TOKEN
          </p>
          <button type="button" onClick={() => void load()} className="btn-primary mt-6">
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <RiskHero
        account={data.account}
        urgency={data.advice.urgency}
        urgencyLabel={data.advice.urgencyLabel}
      />

      <AdvicePanel
        advice={data.advice}
        catalogCount={data.catalogCount}
        onRedeemPrimary={
          data.advice.primary && !data.advice.primary.locked
            ? () => setRedeemTarget(data.advice.primary)
            : undefined
        }
      />

      <RedeemList
        items={data.advice.alternatives}
        availablePoint={Number.parseFloat(data.account.availablePoint) || 0}
        onSelect={(item) => {
          if (!item.locked) setRedeemTarget(item);
        }}
      />

      <LotteryPanel
        lottery={data.lottery}
        lotteryNote={data.advice.lotteryNote}
        onDrawn={() => {
          setToast("抽奖已完成，正在刷新资产…");
          void load();
        }}
      />

      <div className="mx-auto flex max-w-6xl justify-end px-4 pb-4 sm:px-6">
        <button
          type="button"
          onClick={() => void load()}
          className="text-sm font-bold text-[var(--mcd-red)] underline-offset-4 hover:underline"
        >
          刷新资产
        </button>
      </div>

      <SiteFooter />

      {redeemTarget && (
        <RedeemConfirm
          open
          spuId={redeemTarget.spuId}
          spuName={redeemTarget.spuName}
          onClose={() => setRedeemTarget(null)}
          onSuccess={() => {
            setToast("兑换成功，资产已刷新");
            void load();
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--mcd-black)] px-5 py-2 text-sm font-bold text-[var(--mcd-yellow)] shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
