import { extendVariants } from '@heroui/react';
import { Button } from '@heroui/button';

export const FButton = extendVariants(Button, {
  variants: {
    size: {
      sm: 'px-11',
      md: 'px-11 py-6',
      lg: 'px-11 py-6',
    },
  },
});
