// Gauge-to-needle lookup table (gauge in sts / 4 in → standard needle size)
// Sorted ascending by maxGauge: first entry whose maxGauge >= gauge wins.
// Based on CYC yarn weight standards and widely-used knitting references.

interface NeedleSize {
  us: string;
  metric: string;
}

const NEEDLE_TABLE: Array<{ maxGauge: number } & NeedleSize> = [
  { maxGauge: 3.5,      us: "50",   metric: "25 mm"   },
  { maxGauge: 5,        us: "19",   metric: "15 mm"   },
  { maxGauge: 6.5,      us: "17",   metric: "12 mm"   },
  { maxGauge: 9,        us: "13",   metric: "9 mm"    },
  { maxGauge: 11,       us: "11",   metric: "8 mm"    },
  { maxGauge: 12,       us: "10.5", metric: "6.5 mm"  },
  { maxGauge: 14,       us: "10",   metric: "6 mm"    },
  { maxGauge: 16,       us: "9",    metric: "5.5 mm"  },
  { maxGauge: 18,       us: "8",    metric: "5 mm"    },
  { maxGauge: 20,       us: "7",    metric: "4.5 mm"  },
  { maxGauge: 22,       us: "6",    metric: "4 mm"    },
  { maxGauge: 24,       us: "5",    metric: "3.75 mm" },
  { maxGauge: 26,       us: "4",    metric: "3.5 mm"  },
  { maxGauge: 28,       us: "3",    metric: "3.25 mm" },
  { maxGauge: 30,       us: "2",    metric: "2.75 mm" },
  { maxGauge: 32,       us: "1",    metric: "2.25 mm" },
  { maxGauge: 36,       us: "0",    metric: "2 mm"    },
  { maxGauge: Infinity, us: "000",  metric: "1.5 mm"  },
];

// gauge is sts / 4 inches
export function suggestNeedle(gauge: number): NeedleSize {
  return (
    NEEDLE_TABLE.find((entry) => gauge <= entry.maxGauge) ??
    NEEDLE_TABLE[NEEDLE_TABLE.length - 1]
  );
}
