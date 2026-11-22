type LogoProps = {
  href?: string;
};

export function Logo({ href = "#signal" }: LogoProps) {
  return (
    <a className="logo" href={href} aria-label="VitaPulse. Understand your heart. Move with confidence.">
      <svg viewBox="0 0 52 28" aria-hidden="true">
        <path className="logo-trace" d="M1 16h8.2l2.2-4.2 2.4 4.2 2.8-11.2 3.4 18.2 2.6-7H51" />
      </svg>
      <span className="logo-word">
        Vita<span className="logo-pulse">Pulse</span>
      </span>
    </a>
  );
}
