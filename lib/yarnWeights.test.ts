import { YARN_WEIGHT_LABELS } from "./yarnWeights";

describe("YARN_WEIGHT_LABELS", () => {
  it("contains all eight CYC weight keys", () => {
    const keys = [
      "lace",
      "super-fine",
      "fine",
      "light",
      "medium",
      "bulky",
      "super-bulky",
      "jumbo",
    ];
    keys.forEach((key) => {
      expect(YARN_WEIGHT_LABELS).toHaveProperty(key);
    });
  });

  it("maps medium to worsted label", () => {
    expect(YARN_WEIGHT_LABELS["medium"]).toBe("Medium / Worsted (4)");
  });

  it("maps light to DK label", () => {
    expect(YARN_WEIGHT_LABELS["light"]).toBe("Light / DK (3)");
  });

  it("maps jumbo correctly", () => {
    expect(YARN_WEIGHT_LABELS["jumbo"]).toBe("Jumbo (7)");
  });
});
