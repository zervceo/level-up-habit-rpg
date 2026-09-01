// Regulatory transaction fees on SELLS only (both long sells and short sales).
// Rates are an illustrative snapshot, not live-updated — see RULES.md.
export const SEC_FEE_RATE_PER_DOLLAR = 0.0000278; // SEC Section 31 fee
export const TAF_RATE_PER_SHARE = 0.000166; // FINRA Trading Activity Fee (equities)
export const TAF_CAP_PER_TRADE = 8.3;

export interface SaleFees {
  secFee: number;
  tafFee: number;
  total: number;
}

export function computeSaleFees(qty: number, price: number): SaleFees {
  const proceeds = qty * price;
  const secFee = round2(proceeds * SEC_FEE_RATE_PER_DOLLAR);
  const tafFee = round2(Math.min(qty * TAF_RATE_PER_SHARE, TAF_CAP_PER_TRADE));
  return { secFee, tafFee, total: round2(secFee + tafFee) };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
