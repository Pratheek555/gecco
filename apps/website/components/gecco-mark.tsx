/** The Gecco "progress G": a bold G with one inner streak ring. Inherits colour from `currentColor`. */
export function GeccoMark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="8 8 84 84"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M76 24 A36 36 0 1 0 86 50 H50" strokeWidth="11" />
      <path d="M64 38 A18 18 0 1 0 68 50" strokeWidth="9" opacity=".6" />
    </svg>
  );
}
