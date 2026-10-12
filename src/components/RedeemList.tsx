"use client";

import type { AdviceRecommendation } from "@/lib/types";

type Props = {
  items: AdviceRecommendation[];
  availablePoint: number;
  onSelect: (item: AdviceRecommendation) => void;
};

export function RedeemList({ items, availablePoint, onSelect }: Props) {
  const lockedMode = items.length > 0 && items.every((i) => i.locked);

  return (
    <section id="redeem" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <h2 className="section-title">
        {lockedMode ? "攒够可兑 · 目标券" : "备选兑换"}
      </h2>
      {lockedMode && (
        <p className="mt-2 text-sm text-[var(--mcd-gray)]">
          当前积分不足，先锁定性价比目标；攒够后即可确认兑换。
        </p>
      )}

      {items.length === 0 ? (
        <div className="tile mt-5">
          <div className="px-5 py-10 text-sm text-[var(--mcd-gray)] sm:px-7">
            当前商品券目录为空，稍后再来看看。
          </div>
          <div className="tile-foot text-sm font-bold">等待商城上新</div>
        </div>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const shortfall = Math.max(0, item.point - availablePoint);
            const locked = Boolean(item.locked) || shortfall > 0;

            return (
              <li key={item.spuId} className="tile flex flex-col">
                <div className="relative">
                  {item.spuImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.spuImage}
                      alt=""
                      className={`h-40 w-full object-cover ${locked ? "saturate-75" : ""}`}
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-[var(--mcd-bg-soft)] text-sm text-[var(--mcd-gray)]">
                      商品券
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white ${
                      locked ? "bg-[var(--mcd-black)]" : "bg-[var(--mcd-red)]"
                    }`}
                  >
                    {locked ? `还差 ${shortfall}` : `TOP ${index + 1}`}
                  </span>
                </div>
                <div className="tile-foot flex flex-1 flex-col gap-3">
                  <div>
                    <div className="font-extrabold leading-snug">{item.spuName}</div>
                    <div className="mt-2 text-sm font-bold">
                      {item.point} 积分
                      {item.valueScore > 0
                        ? ` · 约 ${item.valueScore.toFixed(2)} 元/分`
                        : ""}
                    </div>
                  </div>
                  {locked ? (
                    <button type="button" disabled className="btn-secondary mt-auto w-full">
                      积分不足
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="btn-primary mt-auto w-full"
                    >
                      确认兑换
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
