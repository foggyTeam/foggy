'use client';

import { Button } from '@heroui/button';
import { CaseSensitiveIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import { Input } from '@heroui/input';
import { useRef, useState } from 'react';
import debounce from 'lodash/debounce';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { useGraphBoardContext } from '@/app/lib/components/board/graph/graphBoardContext';
import settingsStore from '@/app/stores/settingsStore';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import { GEdge } from '@/app/lib/types/definitions';

export default function LabelTool({
  edge,
  onChange,
}: {
  edge: GEdge;
  onChange: (patch: Partial<Pick<GEdge, 'label'>>) => void;
}) {
  const { commonSize, smallerSize } = useAdaptiveParams();
  const { allToolsDisabled } = useGraphBoardContext();

  const [value, setValue] = useState<string>(edge.label || '');

  const debouncedOnChange = useRef(
    debounce((label: string) => onChange({ label: label || undefined }), 256),
  );

  const handleChange = (newValue: string) => {
    setValue(newValue);
    debouncedOnChange.current(newValue);
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          data-testid="edge-label-tool-btn"
          isDisabled={allToolsDisabled}
          variant={!!value ? 'flat' : 'light'}
          color={!!value ? 'primary' : 'default'}
          isIconOnly
          size={commonSize}
        >
          <FTooltip content={settingsStore.t.toolTips.tools.edgeLabel}>
            <CaseSensitiveIcon
              className={clsx(
                !!value ? 'stroke-primary' : 'stroke-default-600',
              )}
            />
          </FTooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          bg_container_no_padding,
          'flex w-fit flex-col gap-2 p-2 sm:p-3',
        )}
      >
        <Input
          autoFocus
          size={smallerSize}
          variant="underlined"
          color="primary"
          label={settingsStore.t.toolBar.edgeLabel}
          placeholder={settingsStore.t.toolBar.edgeLabelPlaceholder}
          value={value}
          onValueChange={handleChange}
          className="w-48"
          classNames={{ input: 'text-default-500' }}
        />
      </PopoverContent>
    </Popover>
  );
}
