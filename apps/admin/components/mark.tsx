/** Gecco HQ's mark: a weight plate seen face on, with the ↗ of Gecco's own mark through its hub. */
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="12" cy="12" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 14 14.2 9.8M11.2 9.6h3.2v3.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
