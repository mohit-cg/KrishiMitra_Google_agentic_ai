import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 9.5V6.75a.75.75 0 0 0-.75-.75H4.5A.75.75 0 0 0 3.75 6.75V18c0 .414.336.75.75.75h4.5" />
      <path d="M9 15h3" />
      <path d="M12 12h3" />
      <path d="M9 9h3" />
      <path d="M17.5 18a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
      <path d="M21 21a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
      <path d="M17.5 13v-3a1.5 1.5 0 0 1 1.5-1.5h0a1.5 1.5 0 0 1 1.5 1.5v3" />
      <path d="m14 14-1-1" />
      <path d="m21.5 12.5-1-1" />
    </svg>
  ),
  wheat: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 22s1-1 2-2c1-1 2-2 3-2s2 1 3 2 2.5 2 2.5 2" />
      <path d="M14 14s-1-1.5-2-2.5c-1-1-2-2.5-2-2.5" />
      <path d="M14 9.5c0-1-.5-2-1.5-2.5S11 6 11 6" />
      <path d="M14 6s-1.5 0-2.5 1s-2 2-2 2" />
      <path d="M14 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
      <path d="M14 6.5h-1.5" />
      <path d="M11 9s-1.5 0-2.5 1-2 2-2 2" />
      <path d="m15 12-1-1" />
      <path d="M20.5 8.5-19 20" />
    </svg>
  ),
  sprout: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 20h10" />
      <path d="M10 20c0-3.3 1-6 4-6" />
      <path d="M12 12A4 4 0 0 1 8 8c0-2 2-4 4-4s4 2 4 4a4 4 0 0 1-4 4Z" />
      <path d="M12 12v8" />
    </svg>
  ),
};
