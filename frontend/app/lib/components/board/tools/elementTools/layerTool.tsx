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
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import settingsStore from '@/app/stores/settingsStore';
import { useBoardContext } from '@/app/lib/components/board/boardContext';

export default function LayerTool() {
  const { selectedElement, allToolsDisabled } = useBoardContext();
  const [currentLayer, setCurrentLayer] = useState({ layer: -1, index: -1 });

  useEffect(() => {
    setCurrentLayer(projectsStore.getElementLayer(selectedElement.attrs.id));
  }, [selectedElement]);

  const changeLayer = (action: 'back' | 'forward' | 'bottom' | 'top') => {
    const newLayer = projectsStore.changeElementLayer(
      selectedElement.attrs.id,
      action,
    );
    setCurrentLayer(newLayer);
  };

  const isDisabled = (top: boolean) => {
    if (top)
      return (
        currentLayer.layer ===
          projectsStore.getMaxMinElementPositions().max.layer &&
        currentLayer.index ===
          projectsStore.getMaxMinElementPositions().max.index
      );
    else
      return (
        currentLayer.layer ===
          projectsStore.getMaxMinElementPositions().min.layer &&
        currentLayer.index ===
          projectsStore.getMaxMinElementPositions().min.index
      );
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          isDisabled={allToolsDisabled}
          variant="light"
          color="default"
          isIconOnly
          size="md"
        >
          <FTooltip content={settingsStore.t.toolTips.tools.layerTool}>
            <LayersIcon className="stroke-default-500" />
          </FTooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={clsx(bg_container_no_padding, 'p-2 sm:p-3')}>
        <div className="flex gap-2">
          <FTooltip content={settingsStore.t.toolTips.tools.layerBottom}>
            <Button
              onPress={() => changeLayer('bottom')}
              isDisabled={isDisabled(false)}
              variant="light"
              color="default"
              isIconOnly
              size="md"
            >
              <ArrowBigDownDashIcon className="stroke-default-500" />
            </Button>
          </FTooltip>
          <FTooltip content={settingsStore.t.toolTips.tools.layerBack}>
            <Button
              onPress={() => changeLayer('back')}
              isDisabled={isDisabled(false)}
              variant="light"
              color="default"
              isIconOnly
              size="md"
            >
              <ArrowBigDownIcon className="stroke-default-500" />
            </Button>
          </FTooltip>
          <FTooltip content={settingsStore.t.toolTips.tools.layerForward}>
            <Button
              onPress={() => changeLayer('forward')}
              isDisabled={isDisabled(true)}
              variant="light"
              color="default"
              isIconOnly
              size="md"
            >
              <ArrowBigUpIcon className="stroke-default-500" />
            </Button>
          </FTooltip>
          <FTooltip content={settingsStore.t.toolTips.tools.layerTop}>
            <Button
              onPress={() => changeLayer('top')}
              isDisabled={isDisabled(true)}
              variant="light"
              color="default"
              isIconOnly
              size="md"
            >
              <ArrowBigUpDashIcon className="stroke-default-500" />
            </Button>
          </FTooltip>
        </div>
      </PopoverContent>
    </Popover>
  );
}
