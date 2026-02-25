import { suggestNeedle } from "./needleSizes";

describe("suggestNeedle", () => {
  it("returns the largest needle for very low gauges", () => {
    expect(suggestNeedle(2)).toEqual(expect.objectContaining({ us: "50", metric: "25 mm" }));
  });

  it("hits the exact boundary at 3.5", () => {
    expect(suggestNeedle(3.5)).toEqual(expect.objectContaining({ us: "50", metric: "25 mm" }));
  });

  it("moves to the next size just above 3.5", () => {
    expect(suggestNeedle(4)).toEqual(expect.objectContaining({ us: "19", metric: "15 mm" }));
  });

  it("returns US 8 / 5mm for gauge 18 (worsted range)", () => {
    expect(suggestNeedle(18)).toEqual(expect.objectContaining({ us: "8", metric: "5 mm" }));
  });

  it("returns US 6 / 4mm for gauge 22", () => {
    expect(suggestNeedle(22)).toEqual(expect.objectContaining({ us: "6", metric: "4 mm" }));
  });

  it("returns US 4 / 3.5mm for gauge 26 (fingering range)", () => {
    expect(suggestNeedle(26)).toEqual(expect.objectContaining({ us: "4", metric: "3.5 mm" }));
  });

  it("returns US 0 / 2mm for gauge 36", () => {
    expect(suggestNeedle(36)).toEqual(expect.objectContaining({ us: "0", metric: "2 mm" }));
  });

  it("falls back to smallest needle (000) for very high gauges", () => {
    expect(suggestNeedle(100)).toEqual(expect.objectContaining({ us: "000", metric: "1.5 mm" }));
  });
});
