import { Button, extendVariants } from '@nextui-org/react';

export const FButton = extendVariants(Button, {
  variants: {
    size: {
      md: 'px-11 py-6',
      lg: 'px-11 py-6',
    },
  },
});
