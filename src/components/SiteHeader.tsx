const navItems = [
  {
    href: "#risk",
    label: "过期风险",
    icon: (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <circle cx="16" cy="16" r="15" fill="#DB0007" />
        <path
          d="M16 8v10"
          stroke="#FFBC0D"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="16" cy="23" r="1.6" fill="#FFBC0D" />
      </svg>
    ),
  },
  {
    href: "#advice",
    label: "处置建议",
    icon: (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <rect x="1" y="1" width="30" height="30" rx="8" fill="#FFBC0D" />
        <path
          d="M9 16.5l4.2 4.2L23 11"
          fill="none"
          stroke="#DB0007"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "#redeem",
    label: "兑券",
    icon: (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <rect x="2" y="7" width="28" height="18" rx="4" fill="#DB0007" />
        <path
          d="M2 13h28M2 19h28"
          stroke="#FFBC0D"
          strokeWidth="1.6"
          strokeDasharray="2.5 2.5"
        />
        <circle cx="10" cy="16" r="2.2" fill="#FFBC0D" />
      </svg>
    ),
  },
  {
    href: "#lottery",
    label: "抽奖",
    icon: (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <circle cx="16" cy="16" r="15" fill="#FFBC0D" />
        <path d="M16 4v24M4 16h24" stroke="#DB0007" strokeWidth="2" />
        <path
          d="M7.5 7.5l17 17M24.5 7.5l-17 17"
          stroke="#DB0007"
          strokeWidth="2"
        />
        <circle cx="16" cy="16" r="4.5" fill="#fff" />
        <circle cx="16" cy="16" r="2.2" fill="#DB0007" />
      </svg>
    ),
  },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--mcd-line)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--mcd-yellow)] text-[1.65rem] font-black leading-none text-[var(--mcd-red)] shadow-[0_2px_0_#e0a800]"
            aria-hidden
          >
            M
          </span>
          <div className="min-w-0">
            <div className="truncate text-base font-extrabold tracking-wide text-[var(--mcd-black)] sm:text-lg">
              麦享会理财官
            </div>
            <div className="hidden text-xs text-[var(--mcd-gray)] sm:block">
              过期提醒 · 兑券建议
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 sm:gap-3 md:gap-5">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex w-14 flex-col items-center gap-1 rounded-lg px-1 py-1 text-[var(--mcd-black)] transition hover:bg-[var(--mcd-bg-soft)] sm:w-16"
            >
              <span className="transition-transform duration-200 group-hover:-translate-y-0.5">
                {item.icon}
              </span>
              <span className="text-[11px] font-bold leading-none group-hover:text-[var(--mcd-red)] sm:text-xs">
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        <a
          href="https://www.mcdonalds.com.cn/"
          target="_blank"
          rel="noreferrer"
          className="hidden text-xs font-bold text-[var(--mcd-red)] underline-offset-4 hover:underline sm:inline sm:text-sm"
        >
          官网
        </a>
      </div>
    </header>
  );
}
