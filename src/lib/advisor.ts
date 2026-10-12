import type {
  AccountInfo,
  AdviceRecommendation,
  AdvisorResult,
  LotteryInfo,
  MallProduct,
  Urgency,
} from "./types";

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function extractFaceValue(product: MallProduct): number {
  const fromPrice = toNumber(product.price);
  if (fromPrice > 0) return fromPrice;

  const text = `${product.spuName ?? ""} ${product.selling ?? ""}`;
  const match = text.match(/(\d+(?:\.\d+)?)\s*元/);
  if (match) return Number.parseFloat(match[1]);
  return 0;
}

function toRecommendation(product: MallProduct): AdviceRecommendation {
  const point = toNumber(product.point);
  const face = extractFaceValue(product);
  return {
    spuId: product.spuId,
    spuName: product.spuName,
    spuImage: product.spuImage,
    point,
    price: product.price,
    selling: product.selling,
    valueScore: point > 0 ? face / point : 0,
  };
}

/** 按性价比排序全部上架商品券 */
function rankCatalog(products: MallProduct[]): AdviceRecommendation[] {
  return products
    .filter((p) => p.status === 2 || p.status === undefined)
    .map(toRecommendation)
    .filter((p) => p.point > 0)
    .sort((a, b) => {
      if (b.valueScore !== a.valueScore) return b.valueScore - a.valueScore;
      return a.point - b.point;
    });
}

function urgencyFromAccount(account: AccountInfo): {
  urgency: Urgency;
  urgencyLabel: string;
} {
  const current = toNumber(account.currentMouthExpirePoint);
  const next = toNumber(account.nextMouthExpirePoint);

  if (current > 0) {
    return { urgency: "high", urgencyLabel: "本月有积分将过期" };
  }
  if (next > 0) {
    return { urgency: "medium", urgencyLabel: "下月有积分将过期" };
  }
  return { urgency: "low", urgencyLabel: "近期无过期压力" };
}

function formatConsumption(lottery: LotteryInfo | null): string | null {
  const next = lottery?.drawDecision?.nextConsumption;
  if (!next) return null;
  if (typeof next === "string") return next;
  if (typeof next === "object") {
    if (next.text) return String(next.text);
    const amount = next.amount ?? lottery?.drawPoint;
    const type = next.type ?? "POINTS";
    if (amount !== undefined && amount !== null) {
      return type === "POINTS" || type === "points"
        ? `${amount} 积分`
        : `${amount} 次`;
    }
  }
  if (lottery?.drawPoint !== undefined) {
    return `${lottery.drawPoint} 积分`;
  }
  return null;
}

function lockedPreviews(catalog: AdviceRecommendation[]): AdviceRecommendation[] {
  return catalog.slice(0, 3).map((p) => ({ ...p, locked: true }));
}

export function buildAdvice(
  account: AccountInfo,
  products: MallProduct[],
  lottery: LotteryInfo | null,
): AdvisorResult {
  const available = toNumber(account.availablePoint);
  const currentExpire = toNumber(account.currentMouthExpirePoint);
  const nextExpire = toNumber(account.nextMouthExpirePoint);
  const expired = toNumber(account.expiredPoint);
  const { urgency, urgencyLabel } = urgencyFromAccount(account);

  const catalog = rankCatalog(products);
  const affordable = catalog.filter((p) => p.point <= available);
  const primary = affordable[0] ?? null;
  const alternatives = affordable.slice(0, 3);

  const eligible = Boolean(lottery?.drawDecision?.resourceEligible);
  const consumption = formatConsumption(lottery);
  let lotteryNote: string | null = null;

  if (eligible && consumption) {
    lotteryNote = `抽奖本次将消耗 ${consumption}；默认建议先兑换商品券，抽奖请手动确认。`;
  } else if (lottery?.activityStatusText) {
    lotteryNote = `抽奖活动状态：${lottery.activityStatusText}`;
  }

  if (available <= 0) {
    const previews = lockedPreviews(catalog);
    const goal = previews[0] ?? null;
    const loss =
      expired > 0
        ? `历史上已有 ${expired} 分过期流失。`
        : "当前没有可用积分。";
    const goalHint = goal
      ? `性价比优选「${goal.spuName}」约需 ${goal.point} 分，先攒起来。`
      : "先去门店消费攒积分，回来再兑换商品券。";

    return {
      urgency,
      urgencyLabel,
      headline: `${loss}${goalHint}`,
      reason: "无可用积分时默认不抽奖；下方展示当前商城高性价比目标券，攒够即可一键兑换。",
      preferRedeem: true,
      primary: goal,
      alternatives: previews,
      lotteryNote,
    };
  }

  if (primary) {
    const expireHint =
      currentExpire > 0
        ? `本月将过期 ${currentExpire} 分，`
        : nextExpire > 0
          ? `下月将过期 ${nextExpire} 分，`
          : "";
    return {
      urgency,
      urgencyLabel,
      headline: `${expireHint}建议用 ${primary.point} 分兑换「${primary.spuName}」。`,
      reason:
        primary.valueScore > 0
          ? `按面额/积分估算，该券性价比靠前（约 ${primary.valueScore.toFixed(2)} 元/分）。优先兑换商品券，抽奖需自行确认。`
          : "优先兑换可核销商品券，锁定积分价值，避免过期。",
      preferRedeem: true,
      primary,
      alternatives,
      lotteryNote,
    };
  }

  const previews = lockedPreviews(catalog);
  const goal = previews[0] ?? null;
  return {
    urgency,
    urgencyLabel,
    headline: goal
      ? `当前有 ${available} 可用积分，距离「${goal.spuName}」还差 ${Math.max(0, goal.point - available)} 分。`
      : `当前有 ${available} 可用积分，但暂无合适商品券可兑。`,
    reason: "可继续攒分冲刺目标券；不建议用未知期望的抽奖消耗现有积分。",
    preferRedeem: false,
    primary: goal,
    alternatives: previews,
    lotteryNote,
  };
}

export function parsePoint(value: string | number | null | undefined): number {
  return toNumber(value);
}
