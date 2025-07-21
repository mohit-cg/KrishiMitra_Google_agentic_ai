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
};
