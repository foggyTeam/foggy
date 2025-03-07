import { Button } from '@heroui/button';
import React, { JSX, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Modal, ModalContent } from '@heroui/modal';

export default function EditorToolButton({
  id,
  value,
  Icon,
  handleClick,
  isAccent,
  popover = false,
  PopoverInnerContent,
}: {
  id?: string;
  value: string | number | boolean;
  Icon: JSX.Element;
  isAccent: boolean;
  popover?: boolean;
  PopoverInnerContent?;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (popover) {
      handleClick(id, localValue);
    }
  }, [setLocalValue, value]);

  return popover ? (
    <>
      <Button
        onPress={() => setModal(!modal)}
        id={id}
        variant="light"
        isIconOnly
        size="sm"
      >
        <Icon
          className={clsx(
            'h-5 w-5',
            isAccent ? 'stroke-f_accent' : 'stroke-default-500',
          )}
        />
      </Button>

      <Modal isOpen={modal} onOpenChange={setModal}>
        <ModalContent>
          {(onClose) => (
            <PopoverInnerContent
              value={localValue}
              changeValue={setLocalValue}
            />
          )}
        </ModalContent>
      </Modal>
    </>
  ) : (
    <Button
      id={id}
      onPress={() => handleClick(id, value)}
      variant="light"
      isIconOnly
      size="sm"
    >
      <Icon
        className={clsx(
          'h-5 w-5',
          isAccent ? 'stroke-f_accent' : 'stroke-default-500',
        )}
      />
    </Button>
  );
}
