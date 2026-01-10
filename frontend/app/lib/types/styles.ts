export const default_padding = 'px-4 py-3 sm:px-6';
export const default_gap = 'gap-2';
export const default_text_size = 'sm:font-medium';
export const container_padding = 'px-1 py-12';

export const bg_container_no_padding: string =
  'overflow-clip border light:border-[hsl(var(--heroui-background)/0.1)] ' +
  'dark:border-[hsl(var(--heroui-foreground)/0.08)] bg-[hsl(var(--heroui-background)/0.5)]' +
  ' backdrop-blur-3xl rounded-xl shadow-container';
export const bg_container: string = ` ${bg_container_no_padding} ${container_padding}`;

export const right_sidebar_layout: string =
  'absolute right-0 top-8 z-50 rounded-r-none rounded-bl-[64px] ' +
  `rounded-tl-2xl ${container_padding} overflow-visible`;
export const left_sidebar_layout: string =
  'absolute left-0 top-8 z-50 rounded-l-none rounded-br-[64px] ' +
  `rounded-tr-2xl ${container_padding} overflow-visible`;

export const el_animation: string =
  'transform transition-all hover:-translate-y-0.5';

export const project_tile: string = 'col-span-3 row-span-3';
export const project_tile_exp: string = 'col-span-6 row-span-9';
export const team_tile: string = 'col-span-4 row-span-2';
export const notification_tile: string = 'col-span-4 row-span-1';
export const notification_tile_exp: string = 'col-span-4 row-span-8';
