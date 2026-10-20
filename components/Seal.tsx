type Props = {
  letter: string;
  className?: string;
  variant?: "mark" | "outline";
  title?: string;
};

/**
 * Eight-pointed star (khatam) built from two squares, with an Arabic letter set in it.
 * "mark" is the solid brand mark; "outline" is used for faculty monograms.
 */
export default function Seal({ letter, className, variant = "outline", title }: Props) {
  const solid = variant === "mark";
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <g
        fill={solid ? "var(--malachite)" : "none"}
        stroke={solid ? "var(--malachite)" : "var(--brass)"}
        strokeWidth={solid ? 0 : 1.6}
        strokeLinejoin="miter"
      >
        <rect x="17" y="17" width="66" height="66" />
        <rect x="17" y="17" width="66" height="66" transform="rotate(45 50 50)" />
      </g>
      {!solid && (
        <circle cx="50" cy="50" r="27" fill="none" stroke="var(--brass)" strokeWidth="0.8" />
      )}
      <text
        x="50"
        y={solid ? 55 : 57}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Amiri, serif"
        fontSize={solid ? 34 : 36}
        fontWeight={700}
        fill={solid ? "var(--brass-pale)" : "var(--malachite)"}
        direction="rtl"
      >
        {letter}
      </text>
    </svg>
  );
}
