import React, { useRef } from 'react';
import { Button } from '@heroui/button';
import { Avatar } from '@heroui/avatar';
import { User2Icon } from 'lucide-react';
import FTooltip from '@/app/lib/components/foggyOverrides/fTooltip';
import clsx from 'clsx';
import { Spinner } from '@heroui/spinner';

export default function UploadAvatarButton({
  handleImageUpload,
  tooltipContent,
  name,
  src,
  isLoading,
  classNames,
}: {
  handleImageUpload: any;
  tooltipContent: string;
  name?: string;
  src?: string;
  isLoading?: boolean;
  classNames?: {
    icon?: string;
    avatar?: string;
  };
}) {
  const imageInputRef = useRef<any>(null);

  const handleClick = () => {
    imageInputRef.current?.click();
  };

  return (
    <FTooltip content={tooltipContent} placement="right">
      <Button
        isDisabled={isLoading}
        onPress={handleClick}
        variant="bordered"
        className="flex h-fit w-fit min-w-fit items-center justify-center rounded-full border-none p-0"
      >
        {isLoading && <Spinner size="lg" className="absolute z-50" />}
        <Avatar
          showFallback
          icon={
            <User2Icon
              className={clsx('h-72 w-72 stroke-default-200', classNames?.icon)}
            />
          }
          name={name}
          src={src}
          size="lg"
          className={clsx('h-72 w-72', classNames?.avatar)}
          color="default"
        />
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </Button>
    </FTooltip>
  );
}
