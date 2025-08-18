
import * as React from 'react';

export const BelIotLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M13 8a2 2 0 0 1-2-2 2 2 0 0 1-2-2" />
    <path d="M13 18a2 2 0 0 0-2 2 2 2 0 0 0-2 2" />
    <path d="M13 12a2 2 0 0 0-2 2 2 2 0 0 1-2 2" />
    <path d="M6 8.5V12v3.5" />
    <path d="M9 5.5V12v6.5" />
    <path d="M17 12h.01" />
    <path d="M19.5 12h.01" />
    <path d="M22 12h.01" />
  </svg>
);
