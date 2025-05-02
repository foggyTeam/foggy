import { HexAlphaColorPicker } from 'react-colorful';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { CopyIcon } from 'lucide-react';

export default function ColorPicker({ value, changeValue }) {
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
        size="sm"
        className="w-[89.2%]"
        classNames={{
          input: 'text-default-500 font-medium',
        }}
        endContent={
          <Button
            onPress={() => {
              navigator.clipboard
                .writeText(value)
                .catch(() => console.error('Failed to copy to clipboard.'));
              console.log('Copied to clipboard!');
            }}
            isIconOnly
            size="sm"
            variant="light"
          >
            <CopyIcon className="h-5 w-5 stroke-default-500" />
          </Button>
        }
      />
    </>
  );
}
