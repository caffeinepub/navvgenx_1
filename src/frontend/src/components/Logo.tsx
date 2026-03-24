interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
  const heights = { sm: "h-7", md: "h-9", lg: "h-12" };

  return (
    <div className="flex items-center select-none">
      <div className="relative">
        <div
          className="absolute inset-0 rounded-lg blur-md opacity-20 dark:opacity-40"
          style={{ background: "oklch(0.72 0.12 75)" }}
        />
        <img
          src="/assets/generated/ngx-logo-transparent.dim_512x512.png"
          alt="NavvGenX AI"
          className={`relative object-contain ${heights[size]}`}
          style={{
            filter: "drop-shadow(0 2px 8px oklch(0.72 0.12 75 / 0.25))",
          }}
        />
      </div>
    </div>
  );
}
