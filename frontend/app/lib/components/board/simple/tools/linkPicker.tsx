import { Input } from '@heroui/input';
import settingsStore from '@/app/stores/settingsStore';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function LinkPicker({
  value,
  changeValue,
}: {
  value: string;
  changeValue: any;
}) {
  const { smallerSize } = useAdaptiveParams();
  return (
    <Input
      autoFocus
      placeholder={settingsStore.t.toolBar.linkPlaceholder}
      label={settingsStore.t.toolBar.linkLabel}
      type="link"
      value={value}
      onValueChange={changeValue}
      color={'primary'}
      variant="underlined"
      size={smallerSize}
      className="w-52"
      classNames={{
        input: 'text-default-500 font-medium',
      }}
    />
  );
}
