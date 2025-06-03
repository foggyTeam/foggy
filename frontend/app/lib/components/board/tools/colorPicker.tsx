import { HexAlphaColorPicker } from 'react-colorful';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { CopyIcon } from 'lucide-react';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';

export default function ColorPicker({
  value,
  changeValue,
}: {
  value: string;
  changeValue: any;
}) {
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
                .catch(() =>
                  addToast({
                    color: 'danger',
                    severity: 'danger',
                    title: settingsStore.t.toasts.copyError,
                  }),
                )
                .then(() =>
                  addToast({
                    color: 'default',
                    severity: 'default',
                    title: settingsStore.t.toasts.copySuccess,
                  }),
                );
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
