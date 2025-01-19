import { Button, extendVariants } from "@heroui/react";

export const FButton = extendVariants(Button, {
  variants: {
    size: {
      md: 'px-11 py-6',
      lg: 'px-11 py-6',
    },
  },
});
