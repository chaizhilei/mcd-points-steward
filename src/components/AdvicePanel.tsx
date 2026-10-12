import type { AdvisorResult } from "@/lib/types";

type Props = {
  advice: AdvisorResult;
  catalogCount: number;
  onRedeemPrimary?: () => void;
};

export function AdvicePanel({ advice, catalogCount, onRedeemPrimary }: Props) {
  const locked = Boolean(advice.primary?.locked);

  return (
    <section id="advice" className="animate-rise-delay mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h2 className="section-title">处置建议</h2>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="tile">
          <div className="min-h-[180px] bg-[linear-gradient(135deg,#fff7e0_0%,#ffffff_55%)] px-5 py-6 sm:px-7 sm:py-8">
            <p className="text-xs font-bold tracking-wide text-[var(--mcd-red)]">
              {locked ? "攒分目标 · 兑换商品券" : "今日主推 · 兑换商品券"}
            </p>
            <h3 className="mt-3 text-2xl font-extrabold leading-snug text-[var(--mcd-black)] sm:text-3xl">
              {advice.headline}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--mcd-gray)] sm:text-base">
              {advice.reason}
            </p>
          </div>
          <div className="tile-foot flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-bold">
              已扫描商品券 {catalogCount} 款
            </span>
            {advice.primary && onRedeemPrimary && !locked ? (
              <button type="button" onClick={onRedeemPrimary} className="btn-primary">
                确认兑换主推荐
              </button>
            ) : (
              <span className="text-sm font-bold text-[var(--mcd-gray)]">
                {locked ? "积分不足 · 先攒再兑" : "暂无可兑换推荐"}
              </span>
            )}
          </div>
        </div>

        {advice.primary ? (
          <div className="tile flex flex-col">
            <div className="relative">
              {advice.primary.spuImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={advice.primary.spuImage}
                  alt={advice.primary.spuName}
                  className={`h-44 w-full object-cover sm:h-48 ${locked ? "opacity-90" : ""}`}
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-[var(--mcd-bg-soft)] text-sm font-bold text-[var(--mcd-gray)] sm:h-48">
                  商品券
                </div>
              )}
              {locked && (
                <span className="absolute left-3 top-3 rounded-full bg-[var(--mcd-black)] px-2.5 py-1 text-xs font-bold text-[var(--mcd-yellow)]">
                  目标券
                </span>
              )}
            </div>
            <div className="tile-foot flex-1">
              <div className="font-extrabold">{advice.primary.spuName}</div>
              <div className="mt-2 text-sm font-bold">
                {advice.primary.point} 积分
                {advice.primary.price ? ` · 约 ¥${advice.primary.price}` : ""}
              </div>
            </div>
          </div>
        ) : (
          <div className="tile flex min-h-[220px] flex-col justify-end bg-[var(--mcd-bg-soft)]">
            <div className="tile-foot">
              <div className="font-extrabold">先攒积分，再来兑换</div>
              <div className="mt-2 text-sm">到店消费可累积麦享会积分</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
