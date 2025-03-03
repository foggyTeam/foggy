import {
  ArrowBigDownDashIcon,
  ArrowBigDownIcon,
  ArrowBigUpDashIcon,
  ArrowBigUpIcon,
  LayersIcon,
} from 'lucide-react';
import { Button } from '@heroui/button';
import projectsStore from '@/app/stores/projectsStore';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';

export default function LayerTool({ element }) {
  const [currentLayer, setCurrentLayer] = useState({ layer: -1, index: -1 });

  useEffect(() => {
    setCurrentLayer(projectsStore.getElementLayer(element.attrs.id));
  }, [element]);

  const changeLayer = (action: 'back' | 'forward' | 'bottom' | 'top') => {
    setCurrentLayer(projectsStore.changeElementLayer(element.attrs.id, action));
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="light" color="default" isIconOnly size="md">
          <LayersIcon className="stroke-default-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={clsx(bg_container_no_padding, 'p-2 sm:p-3')}>
        <div className="flex gap-2">
          <Button
            onPress={() => changeLayer('bottom')}
            isDisabled={currentLayer.layer === 0 && currentLayer.index === 0}
            variant="light"
            color="default"
            isIconOnly
            size="md"
          >
            <ArrowBigDownDashIcon className="stroke-default-500" />
          </Button>
          <Button
            onPress={() => changeLayer('back')}
            isDisabled={currentLayer.layer === 0 && currentLayer.index === 0}
            variant="light"
            color="default"
            isIconOnly
            size="md"
          >
            <ArrowBigDownIcon className="stroke-default-500" />
          </Button>
          <Button
            onPress={() => changeLayer('forward')}
            isDisabled={currentLayer.layer === -2 && currentLayer.index === -2}
            variant="light"
            color="default"
            isIconOnly
            size="md"
          >
            <ArrowBigUpIcon className="stroke-default-500" />
          </Button>
          <Button
            onPress={() => changeLayer('top')}
            isDisabled={currentLayer.layer === -2 && currentLayer.index === -2}
            variant="light"
            color="default"
            isIconOnly
            size="md"
          >
            <ArrowBigUpDashIcon className="stroke-default-500" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
