export type YarnWeightKey =
  | "lace" | "super-fine" | "fine" | "light"
  | "medium" | "bulky" | "super-bulky" | "jumbo";

export const YARN_WEIGHT_LABELS: Record<YarnWeightKey, string> = {
  lace:          "Lace (0)",
  "super-fine":  "Super Fine / Fingering (1)",
  fine:          "Fine / Sport (2)",
  light:         "Light / DK (3)",
  medium:        "Medium / Worsted (4)",
  bulky:         "Bulky (5)",
  "super-bulky": "Super Bulky (6)",
  jumbo:         "Jumbo (7)",
};
