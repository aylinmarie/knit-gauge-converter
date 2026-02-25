import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StitchConverter from "./StitchConverter";
import type { EstimateResult } from "@/app/page";

const makeResult = (overrides?: Partial<EstimateResult>): EstimateResult => ({
  estimatedGauge: 20,
  patternGauge: 18,
  patternYarnWeight: "medium",
  userYarnWeight: "light",
  reasoning: "test reasoning",
  reasoningMetric: "test reasoning metric",
  ...overrides,
});

describe("StitchConverter", () => {
  describe("without a result", () => {
    it("renders the empty hint", () => {
      render(<StitchConverter result={null} />);
      expect(screen.getByText(/Estimate your gauge above first/i)).toBeInTheDocument();
    });

    it("disables the stitch count input", () => {
      render(<StitchConverter result={null} />);
      expect(screen.getByLabelText(/Pattern stitches/i)).toBeDisabled();
    });
  });

  describe("with a result (no row gauge)", () => {
    it("enables the stitch count input", () => {
      render(<StitchConverter result={makeResult()} />);
      expect(screen.getByLabelText(/Pattern stitches/i)).not.toBeDisabled();
    });

    it("does not show the row count input when result has no row gauge", () => {
      render(<StitchConverter result={makeResult()} />);
      expect(screen.queryByLabelText(/Pattern rows/i)).not.toBeInTheDocument();
    });

    it("calculates and displays the new stitch count", async () => {
      const user = userEvent.setup();
      // estimatedGauge 20 / patternGauge 18 → ratio ≈ 1.111 → 50 × 1.111 ≈ round to 56
      render(<StitchConverter result={makeResult({ estimatedGauge: 20, patternGauge: 18 })} />);

      await user.type(screen.getByLabelText(/Pattern stitches/i), "50");

      expect(screen.getByText("56")).toBeInTheDocument();
    });
  });

  describe("with a result that includes row gauge", () => {
    const resultWithRows = makeResult({
      estimatedGauge: 24,
      patternGauge: 18,
      estimatedRowGauge: 32,
      patternRowGauge: 24,
    });

    it("shows the row count input", () => {
      render(<StitchConverter result={resultWithRows} />);
      expect(screen.getByLabelText(/Pattern rows/i)).toBeInTheDocument();
    });

    it("calculates and displays the new row count", async () => {
      const user = userEvent.setup();
      // estimatedRowGauge 32 / patternRowGauge 24 → ratio ≈ 1.333 → 60 × 1.333 ≈ round to 80
      render(<StitchConverter result={resultWithRows} />);

      // Row results only show alongside a stitch result
      await user.type(screen.getByLabelText(/Pattern stitches/i), "1");
      await user.type(screen.getByLabelText(/Pattern rows/i), "60");

      expect(screen.getByText("80")).toBeInTheDocument();
    });
  });
});
