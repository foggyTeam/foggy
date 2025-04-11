import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import { ReactNode } from 'react';
import { FButton } from '@/app/lib/components/foggyOverrides/fButton';

export default function AreYouSureModal({
  isOpen,
  onOpenChange,
  action,
  header,
  description,
  sure,
  dismiss,
}) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent>
        {(onClose) =>
          (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {header}
              </ModalHeader>
              {description && (
                <ModalBody>
                  <p className="text-sm">{description}</p>
                </ModalBody>
              )}
              <ModalFooter className="flex w-full justify-between">
                <FButton
                  color="danger"
                  variant="light"
                  size="md"
                  onPress={action}
                >
                  {sure}
                </FButton>
                <FButton
                  color="primary"
                  variant="bordered"
                  size="md"
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
