"use client";

import { useEffect, useState } from "react";
import type { ProductDetail, ProductSku } from "@/lib/types";

type Props = {
  spuId: number;
  spuName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

function skuLabel(sku: ProductSku): string {
  if (sku.specList?.length) {
    return sku.specList
      .map((s) => `${s.specMain ?? ""}${s.specItem ? `: ${s.specItem}` : ""}`)
      .filter(Boolean)
      .join(" / ");
  }
  return `SKU ${sku.skuId}`;
}

export function RedeemConfirm({
  spuId,
  spuName,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [skuId, setSkuId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"pick" | "confirm">("pick");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetail(null);
    setSkuId(null);
    setStep("pick");

    fetch(`/api/mall/products/${spuId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "加载详情失败");
        return data as ProductDetail;
      })
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        const first = data.skuList?.[0]?.skuId ?? null;
        setSkuId(first);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, spuId]);

  if (!open) return null;

  const selected = detail?.skuList?.find((s) => s.skuId === skuId);
  const category = detail?.spuCategory ?? "1";
  const isPhysical = category === "2";

  async function handleRedeem() {
    if (!skuId || !detail) return;
    if (isPhysical) {
      setError("实物商品需配送地址，MVP 暂仅支持虚拟商品券兑换");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/mall/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm: true,
          skuId,
          spuCategory: category,
          count: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "兑换失败");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "兑换失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg overflow-hidden bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 bg-[var(--mcd-yellow-soft)] px-5 py-4">
          <div>
            <p className="text-xs font-bold text-[var(--mcd-red)]">确认兑换</p>
            <h3 className="mt-1 text-xl font-extrabold text-[var(--mcd-black)]">
              {spuName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-[var(--mcd-gray)] hover:text-[var(--mcd-black)]"
          >
            关闭
          </button>
        </div>

        <div className="px-5 py-5">
          {loading && (
            <p className="text-sm text-[var(--mcd-gray)]">加载 SKU…</p>
          )}

          {error && (
            <p className="mb-4 border border-[var(--mcd-red)]/30 bg-[var(--mcd-red)]/5 px-3 py-2 text-sm text-[var(--mcd-red)]">
              {error}
            </p>
          )}

          {!loading && detail && step === "pick" && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--mcd-gray)]">
                选择规格后进入二次确认
              </p>
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {(detail.skuList ?? []).map((sku) => (
                  <label
                    key={sku.skuId}
                    className={`flex cursor-pointer items-center justify-between gap-3 border px-3 py-3 text-sm transition ${
                      skuId === sku.skuId
                        ? "border-[var(--mcd-red)] bg-[var(--mcd-red)]/5"
                        : "border-[var(--mcd-line)] hover:border-[var(--mcd-black)]/30"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="sku"
                        checked={skuId === sku.skuId}
                        onChange={() => setSkuId(sku.skuId)}
                      />
                      <span className="font-bold">{skuLabel(sku)}</span>
                    </span>
                    <span className="font-bold text-[var(--mcd-red)]">
                      {sku.points ?? "-"} 分
                    </span>
                  </label>
                ))}
              </div>
              {detail.note && (
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-[var(--mcd-gray)]">
                  {detail.note}
                </p>
              )}
              <button
                type="button"
                disabled={!skuId}
                onClick={() => setStep("confirm")}
                className="btn-primary w-full"
              >
                下一步：二次确认
              </button>
            </div>
          )}

          {!loading && detail && step === "confirm" && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--mcd-gray)]">
                即将消耗积分兑换，此操作不可自动撤销。请再次确认。
              </p>
              <div className="border border-[var(--mcd-line)] bg-[var(--mcd-bg-soft)] px-4 py-3 text-sm">
                <div>商品：{detail.spuName ?? spuName}</div>
                <div className="mt-1">
                  规格：{selected ? skuLabel(selected) : "-"}
                </div>
                <div className="mt-1 font-bold text-[var(--mcd-red)]">
                  积分：{selected?.points ?? "-"}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("pick")}
                  className="btn-secondary flex-1"
                >
                  返回
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleRedeem}
                  className="btn-primary flex-1"
                >
                  {submitting ? "兑换中…" : "确认兑换"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
