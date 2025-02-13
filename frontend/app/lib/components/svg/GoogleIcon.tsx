import * as React from 'react';

function GoogleIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 48 48"
      xmlSpace="preserve"
      {...props}
    >
      <path
        d="M42.312 21.5H24.5v6h11.494c-1.515 5.198-6.307 9-11.994 9-6.904 0-12.5-5.596-12.5-12.5S17.096 11.5 24 11.5c3.171 0 6.051 1.197 8.254 3.143l4.244-4.243C33.209 7.365 28.829 5.5 24 5.5 13.783 5.5 5.5 13.783 5.5 24S13.783 42.5 24 42.5 42.5 34.217 42.5 24c0-.85-.077-1.68-.188-2.5z"
        fill="none"
        stroke="#aa99b9"
        strokeWidth={3}
        strokeLinejoin="round"
        strokeMiterlimit={10}
        {...props}
      />
    </svg>
  );
}

export default GoogleIcon;
