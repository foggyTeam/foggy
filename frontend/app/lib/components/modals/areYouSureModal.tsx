import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import { ReactNode } from 'react';
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
                  <p className="text-medium sm:text-sm">{description}</p>
                </ModalBody>
              )}
              <ModalFooter className="flex w-full justify-between">
                <FButton
                  color="danger"
                  variant="light"
                  size={commonSize}
                  onPress={action}
                >
                  {sure}
                </FButton>
                <FButton
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
