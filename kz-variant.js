
import { compute } from "./compute";
import { DEFAULT_KZ_CONFIG } from "./kz-config.js";

// Re-export so tests can import from this module
export { DEFAULT_KZ_CONFIG };

function round2(x) {
  return Math.round(x * 100) / 100;
}

export function k_zona(
  esi1,
  esi2,
  esi3,
  esi4,
  esi5,
  C,
  cfg = DEFAULT_KZ_CONFIG
) {
  const N = Math.max(0, [esi1, esi2, esi3, esi4, esi5].reduce((a, b) => a + b, 0));
  const S = N > 0 ? (esi1 + esi2) / N : 0;
  const R = C > 0 ? N / C : 0;

  let V = 0;
  for (const step of cfg.volume_ladder) {
    if (R <= step.r_max) {
      V = step.bonus;
      break;
    }
  }
  if (S < cfg.low_S_threshold) {
    V = Math.min(V, cfg.volume_cap_if_low_S);
  }

  let A = 0;
  for (const step of cfg.triage_ladder) {
    if (S <= step.s_max) {
      A = step.bonus;
      break;
    }
  }

  return round2(Math.min(1 + V + A, cfg.k_max));
}

export function payout(
  [esi1, esi2, esi3, esi4, esi5],
  zone,
  shift,
  base_rate_eur_h,
  shift_hours,
  cfg = DEFAULT_KZ_CONFIG
) {
  const caps = cfg.capacity_defaults[zone] || cfg.capacity_defaults.OTHER;
  const C = caps[shift];
  const K = k_zona(esi1, esi2, esi3, esi4, esi5, C, cfg);
  const final_rate = base_rate_eur_h * K;
  return {
    K_zona: K,
    final_rate_eur_h: round2(final_rate),
    pay_per_shift: round2(final_rate * shift_hours),
  };
}

export function computeVariant(type, params) {
  if (type === "ladder") {
    return payout(
      params.esi,
      params.zone,
      params.shift,
      params.base_rate_eur_h,
      params.shift_hours,
      params.cfg
    );
  }
  return compute(params, params.thresholds);
}

