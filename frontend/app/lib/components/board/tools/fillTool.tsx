import { CircleIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import { to_rgb } from '@/tailwind.config';

export default function FillTool({ element }) {
  const [fillColor, changeColor] = useState('#ffffff');
  useEffect(() => {
    changeColor(element.attrs.fill ? element.attrs.fill : element.attrs.stroke);
  }, [element]);

  return (
    <Button variant="light" color="default" isIconOnly size="md">
      <CircleIcon fill={fillColor} stroke={`rgba(${to_rgb(fillColor)}, .48)`} />
    </Button>
  );
}
