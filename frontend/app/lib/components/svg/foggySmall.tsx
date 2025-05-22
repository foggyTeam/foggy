import * as React from 'react';
import { danger, primary, secondary } from '@/tailwind.config';

function FoggySmall(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="150"
      height="150"
      fill="none"
      viewBox="0 0 150 150"
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="1" x2="0,5" y2="0">
          <stop offset="0%" stopColor={primary.DEFAULT} />
          <stop offset="30%" stopColor={secondary[400]} />
          <stop offset="35%" stopColor={danger[400]} />
          <stop offset="40%" stopColor={secondary[400]} />
          <stop offset="70%" stopColor={primary.DEFAULT} />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-0,5; 10,0"
            dur="4s"
            repeatCount="indefinite"
            additive="sum"
          />
        </linearGradient>
      </defs>
      <path
        fillRule="evenodd"
        d="M75 96.727h40.364c18.576 0 33.636-15.06 33.636-33.636 0-18.577-15.06-33.637-33.636-33.637-5.653 0-11.38-1.742-15.87-5.175A40.2 40.2 0 0 0 75 16c-15.002 0-28.092 8.184-35.05 20.331-2.376 4.15-7.259 6.578-12.04 6.578C13.047 42.91 1 54.957 1 69.82c0 14.86 12.048 26.908 26.91 26.908H75M1 113a8 8 0 0 1 8-8h98a8 8 0 0 1 0 16H9a8 8 0 0 1-8-8m34 24a8 8 0 0 1 8-8h98a8 8 0 0 1 0 16H43a8 8 0 0 1-8-8m88.498-93.178c.28-.96 1.639-.96 1.919 0l2.582 8.828a1 1 0 0 0 .679.68l8.829 2.581c.959.28.959 1.64 0 1.92l-8.829 2.581a1 1 0 0 0-.679.68l-2.582 8.828c-.28.959-1.639.959-1.919 0l-2.582-8.828a1 1 0 0 0-.679-.68l-8.828-2.581c-.96-.28-.96-1.64 0-1.92l8.828-2.582a1 1 0 0 0 .679-.679zm-28.701 16.33c-.28-.958-1.64-.958-1.92 0l-1.196 4.09a1 1 0 0 1-.68.68l-4.089 1.196c-.96.28-.96 1.64 0 1.92l4.09 1.196a1 1 0 0 1 .68.679l1.195 4.09c.28.959 1.64.959 1.92 0l1.196-4.09a1 1 0 0 1 .679-.68l4.09-1.195c.959-.28.959-1.64 0-1.92l-4.09-1.196a1 1 0 0 1-.68-.68z"
        clipRule="evenodd"
        {...props}
      />
    </svg>
  );
}

export default FoggySmall;
