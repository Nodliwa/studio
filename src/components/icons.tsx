import type { SVGProps } from "react";

export function SimpliPlanLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="140"
      height="35"
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(172, 80%, 45%)", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M 10 25 C 15 10, 25 10, 30 25 S 45 40, 50 25" fill="none" stroke="url(#logo-gradient)" strokeWidth="4" />
      <path d="M 40 25 C 45 10, 55 10, 60 25 S 75 40, 80 25" fill="none" stroke="url(#logo-gradient)" strokeWidth="4" />
    </svg>
  );
}