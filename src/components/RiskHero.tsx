import type { AccountInfo, Urgency } from "@/lib/types";

const urgencyCopy: Record<Urgency, { label: string; className: string }> = {
  high: {
    label: "紧急",
    className: "bg-[var(--mcd-red)] text-white",
  },
  medium: {
    label: "留意",
    className: "bg-[var(--mcd-black)] text-[var(--mcd-yellow)]",
  },
  low: {
    label: "安心",
    className: "bg-white/20 text-white",
  },
};

type Props = {
  account: AccountInfo;
  urgency: Urgency;
  urgencyLabel: string;
};

export function RiskHero({ account, urgency, urgencyLabel }: Props) {
  const badge = urgencyCopy[urgency];

  return (
    <section id="risk" className="animate-rise">
      <div className="relative overflow-hidden bg-[var(--mcd-red)] text-white">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--mcd-yellow)]/25"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-black/10"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>
              {badge.label} · {urgencyLabel}
            </span>
          </div>

          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
            麦享会理财官
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            别让积分安静过期。一眼看清风险，优先兑换商品券，确认后才执行。
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-5 sm:-mt-6 sm:grid-cols-4 sm:gap-4 sm:px-6">
        {[
          {
            label: "可用积分",
            value: account.availablePoint,
            foot: true,
          },
          {
            label: "本月将过期",
            value: account.currentMouthExpirePoint,
            warn: Number(account.currentMouthExpirePoint) > 0,
          },
          {
            label: "下月将过期",
            value: account.nextMouthExpirePoint,
          },
          {
            label: "已过期流失",
            value: account.expiredPoint,
            danger: Number(account.expiredPoint) > 0,
          },
        ].map((item) => (
          <div key={item.label} className="tile shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
            <div className="min-h-[72px] bg-white px-4 pt-4">
              <div
                className={`text-3xl font-black tabular-nums sm:text-4xl ${
                  item.danger
                    ? "text-[var(--mcd-red)]"
                    : item.warn
                      ? "text-[var(--mcd-red)]"
                      : "text-[var(--mcd-black)]"
                }`}
              >
                {item.value}
              </div>
            </div>
            <div
              className={`px-4 py-2.5 text-xs font-bold ${
                item.foot
                  ? "bg-[var(--mcd-yellow-soft)] text-[var(--mcd-black)]"
                  : "bg-[var(--mcd-bg-soft)] text-[var(--mcd-gray)]"
              }`}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
