import { event, registration, registrationLive } from "@/content/hackvita";

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none">
      <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

type Props = {
  /** Label while registration is pending. */
  pendingLabel?: string;
  liveLabel?: string;
  variant?: "pink" | "dark";
  size?: "md" | "sm";
  showSoon?: boolean;
  className?: string;
  tooltip?: boolean;
};

/**
 * Registration CTA: square "+" joined to a pill label.
 * Disabled with "Registration opens soon" while `event.registrationUrl` is null;
 * becomes a live "Register now" link automatically once a URL is set.
 */
export function RegisterCta({
  pendingLabel = registration.pendingLabel,
  liveLabel = registration.liveLabel,
  variant = "pink",
  size = "md",
  showSoon = false,
  className = "",
  tooltip = true,
}: Props) {
  const live = registrationLive();
  const cls = `cta gloss ${variant === "dark" ? "cta--dark" : ""} ${className}`;
  const style = size === "sm" ? ({ "--cta-h": "36px" } as React.CSSProperties) : undefined;

  if (live) {
    return (
      <a
        className={cls}
        style={style}
        href={event.registrationUrl ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="cta__plus">
          <PlusIcon />
        </span>
        <span className="cta__label">
          <span>{liveLabel}</span>
        </span>
      </a>
    );
  }

  return (
    <span
      className={cls}
      style={style}
      role="link"
      aria-disabled="true"
      tabIndex={0}
      data-tip={tooltip ? registration.pendingTooltip : undefined}
      aria-label={`${pendingLabel}. ${registration.pendingTooltip}.`}
    >
      <span className="cta__plus">
        <PlusIcon />
      </span>
      <span className="cta__label">
        <span>{pendingLabel}</span>
        {showSoon && <span className="cta__soon">SOON</span>}
      </span>
    </span>
  );
}
