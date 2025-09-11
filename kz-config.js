export const DEFAULT_KZ_CONFIG = {
  k_max: 1.30,
  volume_ladder: [
    { r_max: 1.00, bonus: 0.05 },
    { r_max: 1.25, bonus: 0.10 },
    { r_max: 1.60, bonus: 0.20 },
    { r_max: 9.99, bonus: 0.30 }, // tik jei S ≥ 10%
  ],
  triage_ladder: [
    { s_max: 0.10, bonus: 0.00 },
    { s_max: 0.20, bonus: 0.05 },
    { s_max: 0.30, bonus: 0.10 },
    { s_max: 1.00, bonus: 0.15 },
  ],
  low_S_threshold: 0.10,
  volume_cap_if_low_S: 0.20,
  capacity_defaults: {
    RED: { D: 16, N: 12 },
    YEL: { D: 22, N: 15 },
    GRN: { D: 28, N: 20 },
    TRIAGE: { D: 35, N: 24 },
    OBS: { D: 14, N: 10 },
    PROCS: { D: 12, N: 10 },
    PED: { D: 20, N: 14 },
    OTHER: { D: 20, N: 16 },
  },
};
