import { CircleIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import { info, to_rgb } from '@/tailwind.config';
import { BoardElement } from '@/app/lib/types/definitions';

export default function FillTool({ element, updateElement }) {
  const [fillColor, changeColor] = useState('#ffffff');
  useEffect(() => {
    changeColor(element.attrs.fill ? element.attrs.fill : element.attrs.stroke);
  }, [element]);

  return (
    <Button
      onPress={() => {
        updateElement(element.attrs.id, {
          fill: info.DEFAULT,
        } as BoardElement);
      }}
      variant="light"
      color="default"
      isIconOnly
      size="md"
    >
      <CircleIcon fill={fillColor} stroke={`rgba(${to_rgb(fillColor)}, .48)`} />
    </Button>
  );
}
