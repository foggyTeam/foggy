import type { Config } from 'tailwindcss';
import { nextui } from '@nextui-org/react';

export function to_rgb(hex: string): string {
  let r = 0;
  let g = 0;
  let b = 0;
  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  if (hex.length !== 6) {
    throw new Error('Invalid hex color format');
  }

  const bigint = parseInt(hex, 16);
  r = (bigint >> 16) & 255;
  g = (bigint >> 8) & 255;
  b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

const foggy_accent = {
  50: '#fcf5fe',
  100: '#F7E6FD',
  200: '#EDCEFC',
  300: '#DEB4F8',
  400: '#CE9FF1',
  500: '#B67FE9',
  600: '#8F5CC8',
  700: '#6B40A7',
  800: '#4A2887',
  900: '#33186F',
  foreground: '#ffffff',
  DEFAULT: '#B67FE9',
};

const foggy_accent_rgb = {
  50: to_rgb(foggy_accent['50']),
  100: to_rgb(foggy_accent['100']),
  200: to_rgb(foggy_accent['200']),
  300: to_rgb(foggy_accent['300']),
  400: to_rgb(foggy_accent['400']),
  500: to_rgb(foggy_accent['500']),
  600: to_rgb(foggy_accent['600']),
  700: to_rgb(foggy_accent['700']),
  800: to_rgb(foggy_accent['800']),
  900: to_rgb(foggy_accent['900']),
  foreground: to_rgb(foggy_accent.foreground),
  DEFAULT: to_rgb(foggy_accent.DEFAULT),
};

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        f_accent: foggy_accent,
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      addCommonColors: true,
      themes: {
        light: {
          colors: {
            background: '#fafafa',
            foreground: '#18181b',
            primary: {
              50: '#faf9fb',
              100: '#F3F1F6',
              200: '#E9E6EE',
              300: '#D8D2E0',
              400: '#C2B7CE',
              500: '#AA99B9',
              600: '#9781A6',
              700: '#846E93',
              800: '#6F5C7B',
              900: '#5B4D65',
              foreground: '#FFFFFF',
              DEFAULT: '#AA99B9',
            },
            secondary: {
              50: '#f9f6f9',
              100: '#F4EFF3',
              200: '#EAE0E8',
              300: '#D9C8D5',
              400: '#B999B1',
              500: '#AC88A2',
              600: '#956D88',
              700: '#7D5970',
              800: '#694B5E',
              900: '#594250',
              foreground: '#FFFFFF',
              DEFAULT: '#AC88A2',
            },
            danger: {
              50: '#fef4f2',
              100: '#FEE6E2',
              200: '#FED1CA',
              300: '#FCB1A5',
              400: '#F88471',
              500: '#DB3D23',
              600: '#BC2319',
              700: '#9D1113',
              800: '#7F0B16',
              900: '#690617',
              foreground: '#FFFFFF',
              DEFAULT: '#DB3D23',
            },
            warning: {
              50: '#fefaec',
              100: '#FCF4D4',
              200: '#F9E8AB',
              300: '#EED17E',
              400: '#DDB75B',
              500: '#C7952B',
              600: '#AB791F',
              700: '#8F6015',
              800: '#73480D',
              900: '#5F3808',
              foreground: '#FFFFFF',
              DEFAULT: '#C7952B',
            },
            info: {
              50: '#ecfffe',
              100: '#CBFDFC',
              200: '#98F8FC',
              300: '#64E7F8',
              400: '#3DD0F1',
              500: '#02AEE8',
              600: '#0187C7',
              700: '#0165A7',
              800: '#004886',
              900: '#00346F',
              foreground: '#FFFFFF',
              DEFAULT: '#02AEE8',
            },
            success: {
              50: '#f5f8f5',
              100: '#E0EBE0',
              200: '#C3D7C4',
              300: '#99B99D',
              400: '#6F9875',
              500: '#4F7A57',
              600: '#396846',
              700: '#275739',
              800: '#19462E',
              900: '#0F3A27',
              foreground: '#FFFFFF',
              DEFAULT: '#4F7A57',
            },
          },
        },
        dark: {
          colors: {
            background: '#18181b',
            foreground: '#fafafa',
          },
        },
      },
      layout: {
        fontSize: {
          tiny: '10px', // text-tiny
          small: '14px', // text-small
          medium: '18px', // text-medium
          large: '20px', // text-large
        },
        disabledOpacity: '0.3',
        radius: {
          small: '8px', // rounded-small
          medium: '16px', // rounded-medium
          large: '32px', // rounded-large
        },
        borderWidth: {
          small: '1px', // border-small
          medium: '1px', // border-medium
          large: '2px', // border-large
        },
      },
    }),
    function ({ addUtilities }) {
      const avatars = {
        '.accent-avatar': {
          color: foggy_accent.foreground,
          backgroundColor: foggy_accent.DEFAULT,
          boxShadow: `var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) hsl(var(--nextui-background)), var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) ${foggy_accent.DEFAULT}, var(--tw-shadow, 0 0 #00000)`,
        },
      };
      const badges = {
        '.accent-badge-s': {
          borderColor: 'hsl(var(--nextui-background))',
          backgroundColor: foggy_accent.DEFAULT,
          color: foggy_accent.foreground,
        },
        '.accent-badge-fl': {
          borderColor: 'hsl(var(--nextui-background))',
          backgroundColor: `rgba(${foggy_accent_rgb.DEFAULT}, 0.2)`,
          color: foggy_accent['700'],
        },
        '.accent-badge-f': {
          color: foggy_accent.DEFAULT,
          borderColor: 'hsl(var(--nextui-default))',
          backgroundColor: 'hsl(var(--nextui-default-100))',
        },
        '.accent-badge-sh': {
          borderColor: 'hsl(var(--nextui-background))',
          backgroundColor: foggy_accent.DEFAULT,
          color: foggy_accent.foreground,
          boxShadow: `0 10px 15px -3px rgba(${foggy_accent_rgb.DEFAULT}, 0.4), 0 4px 6px -4px rgba(${foggy_accent_rgb.DEFAULT}, 0.4)`,
        },
      };
      const buttons = {
        /* accent-solid */
        '.accent-s': {
          backgroundColor: foggy_accent.DEFAULT,
          color: foggy_accent.foreground,
        },
        /* accent-faded */
        '.accent-f': {
          backgroundColor: 'hsl(var(--nextui-default-100))',
          border:
            'var(--nextui-border-width-medium) solid hsl(var(--nextui-default))',
          color: foggy_accent.DEFAULT,
        },
        /* accent-bordered */
        '.accent-b': {
          backgroundColor: 'rgba(0, 0, 0, 0)',
          border: `var(--nextui-border-width-medium) solid ${foggy_accent.DEFAULT}`,
          color: foggy_accent.DEFAULT,
        },
        /* accent-light */
        '.accent-l': {
          backgroundColor: 'rgba(0, 0, 0, 0)',
          color: foggy_accent.DEFAULT,
        },
        '.accent-l:hover': {
          opacity: '1',
          backgroundColor: `rgba(${foggy_accent_rgb.DEFAULT}, 0.25)`,
        },
        /* accent-flat */
        '.accent-fl': {
          backgroundColor: `rgba(${foggy_accent_rgb.DEFAULT}, 0.2)`,
          color: foggy_accent.DEFAULT,
        },
        /* accent-ghost */
        '.accent-g': {
          backgroundColor: 'rgba(0, 0, 0, 0)',
          border: `var(--nextui-border-width-medium) solid ${foggy_accent.DEFAULT}`,
          color: foggy_accent.DEFAULT,
        },
        '.accent-g:hover': {
          backgroundColor: foggy_accent.DEFAULT,
          color: foggy_accent.foreground,
        },
        /* accent-shadow */
        '.accent-sh': {
          backgroundColor: foggy_accent.DEFAULT,
          color: foggy_accent.foreground,
          boxShadow: `0 10px 15px -3px rgba(${foggy_accent_rgb.DEFAULT}, 0.4), 0 4px 6px -4px rgba(${foggy_accent_rgb.DEFAULT}, 0.4)`,
        },
      };

      addUtilities({ ...avatars, ...badges, ...buttons }, [
        'responsive',
        'hover',
      ]);
    },
  ],
} satisfies Config;
