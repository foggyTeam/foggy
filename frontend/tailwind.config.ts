import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

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

  if (hex.length > 6) {
    hex = hex.slice(0, 6);
  }

  while (hex.length < 6) hex += '0';

  const bigint = parseInt(hex, 16);
  r = (bigint >> 16) & 255;
  g = (bigint >> 8) & 255;
  b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

export const foggy_accent = {
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
export const primary = {
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
};
export const secondary = {
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
};
export const danger = {
  50: '#faf7f6',
  100: '#F6ECEA',
  200: '#EFDCD9',
  300: '#E2C3BF',
  400: '#D0A099',
  500: '#B67268',
  600: '#A7655B',
  700: '#8B524A',
  800: '#744740',
  900: '#623F3A',
  foreground: '#FFFFFF',
  DEFAULT: '#B67268',
};
export const success = {
  50: '#f5f8f5',
  100: '#E0EBE0',
  200: '#C3D7C4',
  300: '#99B99D',
  400: '#6F9875',
  500: '#4F7A57',
  600: '#3B6043',
  700: '#2F4D36',
  800: '#273E2D',
  900: '#213325',
  foreground: '#FFFFFF',
  DEFAULT: '#4F7A57',
};
export const warning = {
  50: '#f8f7f2',
  100: '#E1DDC7',
  200: '#CEC6A3',
  300: '#EED17E',
  400: '#B8A87A',
  500: '#AB9664',
  600: '#9E8458',
  700: '#846C4A',
  800: '#6C5840',
  900: '#584936',
  foreground: '#FFFFFF',
  DEFAULT: '#AB9664',
};
export const info = {
  50: '#f5f8fa',
  100: '#EAF0F5',
  200: '#D9E4EC',
  300: '#C1D2E0',
  400: '#A7BBD2',
  500: '#8EA3C2',
  600: '#798CB2',
  700: '#67779B',
  800: '#55637E',
  900: '#495366',
  foreground: '#FFFFFF',
  DEFAULT: '#8EA3C2',
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

const scrollbarPlugin = require('tailwind-scrollbar');

export default {
  content: [
    './(pages)/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        f_accent: foggy_accent,
        primary,
        secondary,
        danger,
        success,
        warning,
        info,
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      addCommonColors: true,
      themes: {
        light: {
          colors: {
            background: '#fafafa',
            foreground: '#18181b',
            primary: primary,
            secondary: secondary,
            danger: danger,
            warning: warning,
            success: success,
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
    scrollbarPlugin({ nocompatible: true }),
    function ({ addUtilities }: any) {
      const avatars = {
        '.accent-avatar': {
          color: foggy_accent.foreground,
          backgroundColor: foggy_accent.DEFAULT,
          boxShadow: `var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) hsl(var(--heroui-background)), var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) ${foggy_accent.DEFAULT}, var(--tw-shadow, 0 0 #00000)`,
        },
      };
      const badges = {
        '.accent-badge-s': {
          borderColor: 'hsl(var(--heroui-background))',
          backgroundColor: foggy_accent.DEFAULT,
          color: foggy_accent.foreground,
        },
        '.accent-badge-fl': {
          borderColor: 'hsl(var(--heroui-background))',
          backgroundColor: `rgba(${foggy_accent_rgb.DEFAULT}, 0.2)`,
          color: foggy_accent['700'],
        },
        '.accent-badge-f': {
          color: foggy_accent.DEFAULT,
          borderColor: 'hsl(var(--heroui-default))',
          backgroundColor: 'hsl(var(--heroui-default-100))',
        },
        '.accent-badge-sh': {
          borderColor: 'hsl(var(--heroui-background))',
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
          backgroundColor: 'hsl(var(--heroui-default-100))',
          border:
            'var(--heroui-border-width-medium) solid hsl(var(--heroui-default))',
          color: foggy_accent.DEFAULT,
        },
        /* accent-bordered */
        '.accent-b': {
          backgroundColor: 'rgba(0, 0, 0, 0)',
          border: `var(--heroui-border-width-medium) solid ${foggy_accent.DEFAULT}`,
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
          border: `var(--heroui-border-width-medium) solid ${foggy_accent.DEFAULT}`,
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

      const theme_styles = {
        '.shadow-container': {
          boxShadow: `2px 4px 10px 0 rgba(${to_rgb(primary.DEFAULT)}, 0.04)`,
        },
        '.accent-link': {
          transitionProperty: 'color, text-decoration-color, fill, stroke',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: '200ms',
        },
        '.accent-link:hover': {
          color: `rgb(${to_rgb(foggy_accent.DEFAULT)})`,
        },
      };

      addUtilities({ ...avatars, ...badges, ...buttons, ...theme_styles }, [
        'responsive',
        'hover',
      ]);
    },
  ],
} satisfies Config;
