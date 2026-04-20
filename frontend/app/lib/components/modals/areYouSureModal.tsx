import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import React, { ReactNode } from 'react';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export default function AreYouSureModal({
  isOpen,
  onOpenChange,
  action,
  header,
  description,
  sure,
  dismiss,
}: {
  isOpen: boolean;
  onOpenChange: any;
  action: any;
  header: string;
  description?: string;
  sure: string;
  dismiss: string;
}) {
  const { commonSize } = useAdaptiveParams();
  return (
    <Modal
      placement="center"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter') action();
      }}
    >
      <ModalContent>
        {(onClose) =>
          (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {header}
              </ModalHeader>
              {description && (
                <ModalBody>
                  <p className="text-medium sm:text-sm">{description}</p>
                </ModalBody>
              )}
              <ModalFooter className="flex w-full justify-between">
                <FButton
                  data-testid="sure-btn"
                  color="danger"
                  variant="light"
                  size={commonSize}
                  onPress={action}
                >
                  {sure}
                </FButton>
                <FButton
                  data-testid="dismiss-btn"
                  color="primary"
                  variant="bordered"
                  size={commonSize}
                  onPress={onClose}
                >
                  {dismiss}
                </FButton>
              </ModalFooter>
            </>
          ) as ReactNode
        }
      </ModalContent>
    </Modal>
  );
}
