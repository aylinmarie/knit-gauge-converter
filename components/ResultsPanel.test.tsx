import { render, screen } from "@testing-library/react";
import ResultsPanel from "./ResultsPanel";
import type { EstimateResult } from "@/app/page";

const baseResult: EstimateResult = {
  estimatedGauge: 18,
  patternGauge: 18,
  patternYarnWeight: "medium",
  userYarnWeight: "light",
  reasoning: "Same gauge, no change needed.",
  reasoningMetric: "Same gauge, no change needed.",
};

describe("ResultsPanel", () => {
  describe("loading state", () => {
    it("renders the skeleton loader", () => {
      const { container } = render(
        <ResultsPanel result={null} loading={true} error={null} unit="imperial" />
      );
      // Skeleton exists as a container element
      expect(container.firstChild).not.toBeNull();
      expect(screen.queryByText(/Estimation failed/i)).not.toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("displays the error title and message", () => {
      render(
        <ResultsPanel
          result={null}
          loading={false}
          error="Something went wrong."
          unit="imperial"
        />
      );
      expect(screen.getByText("Estimation failed")).toBeInTheDocument();
      expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("renders the prompt to fill in the form", () => {
      render(
        <ResultsPanel result={null} loading={false} error={null} unit="imperial" />
      );
      expect(
        screen.getByText(/Fill in the form and click/i)
      ).toBeInTheDocument();
    });
  });

  describe("result state — imperial", () => {
    it("shows estimated stitch gauge in sts/4″", () => {
      render(
        <ResultsPanel
          result={baseResult}
          loading={false}
          error={null}
          unit="imperial"
        />
      );
      expect(screen.getByText("18")).toBeInTheDocument();
      expect(screen.getByText(/sts \/ 4/)).toBeInTheDocument();
    });

    it("shows yarn weight labels for pattern and user weights", () => {
      render(
        <ResultsPanel
          result={baseResult}
          loading={false}
          error={null}
          unit="imperial"
        />
      );
      expect(screen.getByText("Medium / Worsted (4)")).toBeInTheDocument();
      expect(screen.getByText("Light / DK (3)")).toBeInTheDocument();
    });

    it("shows a needle suggestion", () => {
      render(
        <ResultsPanel
          result={baseResult}
          loading={false}
          error={null}
          unit="imperial"
        />
      );
      expect(screen.getByText(/Suggested starting needle/i)).toBeInTheDocument();
      expect(screen.getByText(/US \d/)).toBeInTheDocument();
    });
  });

  describe("result state — metric", () => {
    it("shows gauge in sts/10 cm units", () => {
      render(
        <ResultsPanel
          result={baseResult}
          loading={false}
          error={null}
          unit="metric"
        />
      );
      expect(screen.getByText(/sts \/ 10 cm/)).toBeInTheDocument();
    });
  });

  describe("result with row gauge", () => {
    it("shows the row gauge value", () => {
      render(
        <ResultsPanel
          result={{ ...baseResult, estimatedRowGauge: 24, patternRowGauge: 24 }}
          loading={false}
          error={null}
          unit="imperial"
        />
      );
      expect(screen.getByText(/Row gauge/i)).toBeInTheDocument();
    });
  });
});
