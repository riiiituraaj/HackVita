type ChipProps = {
  children: string;
  variant?: "default" | "solid" | "alert" | "tba";
  className?: string;
  /** Scramble the text on hover (handled globally by <Interactions/>). */
  scramble?: boolean;
};

export function Chip({ children, variant = "default", className = "", scramble = true }: ChipProps) {
  const v = variant === "default" ? "" : `chip--${variant}`;
  return (
    <span className={`chip ${v} ${className}`}>
      <span data-scramble={scramble ? "" : undefined}>{children}</span>
    </span>
  );
}

/**
 * Deliberate "pending" terminal state for details the organizer has not supplied.
 * Renders as e.g. `VENUE: TBA`.
 */
export function TbaChip({ label = "STATUS", value = "TBA", className = "" }: {
  label?: string;
  value?: string;
  className?: string;
}) {
  return (
    <span className={`chip chip--tba ${className}`}>
      <span data-scramble="">{`${label.toUpperCase()}: ${value}`}</span>
    </span>
  );
}
