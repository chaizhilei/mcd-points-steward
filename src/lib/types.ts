export type Urgency = "high" | "medium" | "low";

export type AccountInfo = {
  accountId: string;
  availablePoint: string;
  accumulativePoint: string;
  currency: string;
  currentMouthExpirePoint: string;
  nextMouthExpirePoint: string;
  expiredPoint: string;
  frozenPoint: string;
  usedPoint: string;
  lastMouthExpirePoint: string;
};

export type MallProduct = {
  spuId: number;
  spuName: string;
  spuImage?: string;
  point: string;
  price?: string;
  selling?: string;
  catName?: string;
  shopId?: number;
  status?: number;
  upTime?: string;
  downTime?: string;
};

export type LotteryPrize = {
  name?: string;
  imageUrl?: string;
  typeText?: string;
};

export type DrawConsumption = {
  type?: string;
  amount?: number | string;
  text?: string;
  [key: string]: unknown;
};

export type DrawDecision = {
  resourceEligible?: boolean;
  nextConsumption?: DrawConsumption | string | null;
  fallbackConsumption?: DrawConsumption | string | null;
  [key: string]: unknown;
};

export type LotteryInfo = {
  activityCode?: string;
  activityName?: string;
  activityStatusText?: string;
  beginTime?: string;
  endTime?: string;
  drawPoint?: number | string;
  drawTypeText?: string;
  availableTimes?: number | null;
  availablePoint?: number | string;
  drawDecision?: DrawDecision;
  prizes?: LotteryPrize[];
};

export type SkuSpec = {
  specMain?: string;
  specItem?: string;
};

export type ProductSku = {
  skuId: number;
  points?: string;
  price?: string;
  extTradePrice?: string;
  specList?: SkuSpec[];
};

export type ProductDetail = {
  spuId: number;
  spuName?: string;
  shopId?: number;
  spuCategory?: string;
  detail?: string;
  note?: string;
  selling?: string;
  images?: string[];
  skuList?: ProductSku[];
  downTime?: string;
};

export type AdviceRecommendation = {
  spuId: number;
  spuName: string;
  spuImage?: string;
  point: number;
  price?: string;
  selling?: string;
  valueScore: number;
  /** true = 积分不足，仅预览 */
  locked?: boolean;
};

export type AdvisorResult = {
  urgency: Urgency;
  urgencyLabel: string;
  headline: string;
  reason: string;
  preferRedeem: boolean;
  primary: AdviceRecommendation | null;
  alternatives: AdviceRecommendation[];
  lotteryNote: string | null;
};

export type PortfolioResponse = {
  account: AccountInfo;
  advice: AdvisorResult;
  lottery: LotteryInfo | null;
  catalogCount: number;
};
