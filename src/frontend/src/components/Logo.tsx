interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
  const dim = { sm: 28, md: 36, lg: 52 };
  const textSizes = { sm: "text-base", md: "text-xl", lg: "text-3xl" };
  const d = dim[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* NGX Monogram SVG */}
      <svg
        width={d}
        height={d}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 animate-logo-pulse"
        role="img"
        aria-label="NavvGenX logo"
      >
        <title>NavvGenX logo</title>
        <rect width="40" height="40" rx="9" fill="oklch(0.10 0.020 265)" />
        {/* N */}
        <text
          x="3"
          y="28"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="700"
          fontSize="13"
          fill="oklch(0.97 0.003 255)"
        >
          N
        </text>
        {/* G — gold accent letter */}
        <text
          x="13.5"
          y="28"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="700"
          fontSize="13"
          fill="oklch(0.72 0.14 75)"
        >
          G
        </text>
        {/* X */}
        <text
          x="24.5"
          y="28"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="700"
          fontSize="13"
          fill="oklch(0.97 0.003 255)"
        >
          X
        </text>
        {/* Gold underline accent */}
        <rect
          x="12"
          y="31"
          width="10"
          height="2"
          rx="1"
          fill="oklch(0.72 0.14 75)"
        />
      </svg>

      {/* Artistic wordmark */}
      <span
        className={`font-bricolage font-extrabold ${textSizes[size]} navvgenx-gradient-text tracking-tight`}
        style={{ letterSpacing: "-0.02em" }}
      >
        NavvGenX
      </span>
    </div>
  );
}
