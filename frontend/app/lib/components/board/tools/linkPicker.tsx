import { Input } from '@heroui/input';
import settingsStore from '@/app/stores/settingsStore';

export default function LinkPicker({
  value,
  changeValue,
}: {
  value: string;
  changeValue: any;
}) {
  return (
    <Input
      placeholder={settingsStore.t.toolBar.linkPlaceholder}
      label={settingsStore.t.toolBar.linkLabel}
      type="link"
      value={value}
      onValueChange={changeValue}
      color={'primary'}
      variant="underlined"
      size="sm"
      className="w-52"
      classNames={{
        input: 'text-default-500 font-medium',
      }}
    />
  );
}
