import { HexAlphaColorPicker } from 'react-colorful';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { CopyIcon } from 'lucide-react';
import { CopyToClipboard } from '@/app/lib/utils/copyToClipboard';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function ColorPicker({
  value,
  changeValue,
}: {
  value: string;
  changeValue: any;
}) {
  const { commonSize } = useAdaptiveParams();

  return (
    <>
      <HexAlphaColorPicker
        color={value}
        onChange={changeValue}
        className="w-full gap-1 rounded-md"
      />
      <Input
        value={value}
        onValueChange={changeValue}
        color={'primary'}
        variant="underlined"
        size={commonSize}
        className="w-[89.2%]"
        classNames={{
          input: 'text-default-500 font-medium',
        }}
        endContent={
          <Button
            onPress={() => {
              CopyToClipboard(value);
            }}
            isIconOnly
            size={commonSize}
            variant="light"
          >
            <CopyIcon className="stroke-default-600 h-5 w-5" />
          </Button>
        }
      />
    </>
  );
}
