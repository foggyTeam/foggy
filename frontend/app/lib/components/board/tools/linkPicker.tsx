import { Input } from '@heroui/input';

export default function LinkPicker({ value, changeValue }) {
  return (
    <Input
      value={value}
      onValueChange={changeValue}
      color={'primary'}
      variant="underlined"
      size="sm"
      className="z-50 w-[89.2%]"
      classNames={{
        input: 'text-default-500 font-medium',
      }}
    />
  );
}
