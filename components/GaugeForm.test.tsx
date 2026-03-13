import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GaugeForm from "./GaugeForm";

const defaultProps = {
  onSubmit: jest.fn(),
  loading: false,
  unit: "imperial" as const,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GaugeForm", () => {
  describe("rendering", () => {
    it("shows imperial gauge unit label", () => {
      render(<GaugeForm {...defaultProps} unit="imperial" />);
      expect(screen.getByText("sts per 4 inches")).toBeInTheDocument();
    });

    it("shows metric gauge unit label", () => {
      render(<GaugeForm {...defaultProps} unit="metric" />);
      expect(screen.getByText("sts per 10 cm")).toBeInTheDocument();
    });

    it("renders the submit button with correct text", () => {
      render(<GaugeForm {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: "Estimate Gauge" })
      ).toBeInTheDocument();
    });

    it("disables the submit button while loading", () => {
      render(<GaugeForm {...defaultProps} loading={true} />);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("form submission", () => {
    it("calls onSubmit with imperial gauge values unchanged", async () => {
      const user = userEvent.setup();
      render(<GaugeForm {...defaultProps} unit="imperial" />);

      const gaugeInput = screen.getByLabelText(/Stitch Gauge/i);
      await user.clear(gaugeInput);
      await user.type(gaugeInput, "20");

      await user.click(screen.getByRole("button", { name: "Estimate Gauge" }));

      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ patternGauge: 20 })
      );
    });

    it("converts metric gauge to imperial sts/4in on submit", async () => {
      const user = userEvent.setup();
      render(<GaugeForm {...defaultProps} unit="metric" />);

      const gaugeInput = screen.getByLabelText(/Stitch Gauge/i);
      await user.clear(gaugeInput);
      await user.type(gaugeInput, "20");

      await user.click(screen.getByRole("button", { name: "Estimate Gauge" }));

      // 20 sts/10cm × (10.16/10) ≈ 20.32
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ patternGauge: 20 * (10.16 / 10) })
      );
    });

    it("includes row gauge in submission when provided", async () => {
      const user = userEvent.setup();
      render(<GaugeForm {...defaultProps} unit="imperial" />);

      const rowGaugeInput = screen.getByLabelText(/Row Gauge/i);
      await user.type(rowGaugeInput, "24");

      await user.click(screen.getByRole("button", { name: "Estimate Gauge" }));

      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ patternRowGauge: 24 })
      );
    });

    it("omits row gauge when field is left empty", async () => {
      const user = userEvent.setup();
      render(<GaugeForm {...defaultProps} unit="imperial" />);

      await user.click(screen.getByRole("button", { name: "Estimate Gauge" }));

      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ patternRowGauge: undefined })
      );
    });

    it("does not call onSubmit when gauge is 0", async () => {
      const user = userEvent.setup();
      render(<GaugeForm {...defaultProps} />);

      const gaugeInput = screen.getByLabelText(/Stitch Gauge/i);
      await user.clear(gaugeInput);
      await user.type(gaugeInput, "0");

      await user.click(screen.getByRole("button", { name: "Estimate Gauge" }));

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("patternLocked mode", () => {
    const lockedPrefill = {
      patternGauge: 18,
      patternRowGauge: 24,
      patternYarnWeight: "medium",
    };

    it("hides pattern input fields when patternLocked is true", () => {
      render(
        <GaugeForm
          {...defaultProps}
          patternLocked={true}
          prefill={lockedPrefill}
        />
      );
      expect(screen.queryByLabelText(/Pattern Yarn Weight/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Stitch Gauge/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Row Gauge/i)).not.toBeInTheDocument();
    });

    it("shows locked card with yarn weight label when patternLocked is true", async () => {
      render(
        <GaugeForm
          {...defaultProps}
          patternLocked={true}
          prefill={lockedPrefill}
        />
      );
      // Wait for prefill useEffect to run and check locked card is visible
      const card = await screen.findByLabelText(/Pattern info from Ravelry/i);
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent(/Medium \/ Worsted/i);
    });

    it("submits prefilled values when patternLocked is true", async () => {
      const user = userEvent.setup();
      render(
        <GaugeForm
          {...defaultProps}
          patternLocked={true}
          prefill={lockedPrefill}
        />
      );

      await user.click(screen.getByRole("button", { name: "Estimate Gauge" }));

      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          patternGauge: 18,
          patternRowGauge: 24,
          patternYarnWeight: "medium",
        })
      );
    });
  });
});
