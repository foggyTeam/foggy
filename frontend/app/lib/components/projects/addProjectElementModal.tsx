import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import React, { ReactNode, useEffect, useState } from 'react';
import { Tab, Tabs } from '@heroui/tabs';
import { ProjectElementTypes } from '@/app/lib/types/definitions';
import ElementIcon from '@/app/lib/components/menu/leftSideBar/elementIcon';
import settingsStore from '@/app/stores/settingsStore';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import IsFormValid from '@/app/lib/utils/isFormValid';
import { projectElementNameSchema } from '@/app/lib/types/schemas';

export default function AddProjectElementModal({
  isOpen,
  onOpenChange,
  action,
  boardOnly = false,
  sectionOnly = false,
}: {
  isOpen: boolean;
  onOpenChange: any;
  action: (nodeName: string, nodeType: ProjectElementTypes) => void;
  boardOnly?: boolean;
  sectionOnly?: boolean;
}) {
  const [name, setName] = useState<string>('');
  const [error, setError] = useState({} as any);
  const [filetype, setFiletype] = useState<ProjectElementTypes>(
    sectionOnly ? 'SECTION' : 'SIMPLE',
  );
  const disabledKeys: ProjectElementTypes[] = boardOnly
    ? ['SECTION']
    : sectionOnly
      ? ['SIMPLE', 'GRAPH', 'TREE']
      : [];
  const filetypeTabs: ProjectElementTypes[] = [
    'SECTION',
    'SIMPLE',
    'GRAPH',
    'TREE',
  ];

  useEffect(() => {
    IsFormValid({ name }, projectElementNameSchema, setError);
  }, [name, setError]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent className="flex w-fit max-w-xl gap-2 overflow-visible p-6 pt-0">
        {(onClose) =>
          (
            <>
              <ModalHeader className="-mt-16 pb-0 pl-0">
                <Tabs
                  selectedKey={filetype}
                  onSelectionChange={(key) =>
                    setFiletype(key as ProjectElementTypes)
                  }
                  variant="light"
                  disabledKeys={disabledKeys}
                  aria-label="Filtypes"
                  size="lg"
                >
                  {filetypeTabs.map((filetype) => (
                    <Tab
                      key={filetype}
                      title={<ElementIcon elementType={filetype} />}
                    />
                  ))}
                </Tabs>
              </ModalHeader>
              <ModalBody className="flex h-fit w-fit max-w-xl flex-col gap-4 pt-6">
                <h1 className="font-medium">
                  {
                    settingsStore.t.projects.addElement[
                      filetype.toLowerCase() as
                        | 'section'
                        | 'simple'
                        | 'graph'
                        | 'tree'
                    ].new
                  }
                </h1>
                <Input
                  value={name}
                  onValueChange={setName}
                  isInvalid={error.name}
                  errorMessage={error.name}
                  radius="full"
                  size="sm"
                  type="text"
                  className="m-0 w-56 p-0"
                  classNames={{
                    inputWrapper: 'text-sm',
                    input: 'text-sm',
                  }}
                  placeholder={
                    settingsStore.t.projects.addElement[
                      filetype.toLowerCase() as
                        | 'section'
                        | 'simple'
                        | 'graph'
                        | 'tree'
                    ].placeholder
                  }
                />
                {/* Maybe some presets here*/}
                <Button
                  onPress={() => action(name, filetype)}
                  isDisabled={error.name}
                  color="primary"
                >
                  {settingsStore.t.projects.addElement.create}
                </Button>
              </ModalBody>
            </>
          ) as ReactNode
        }
      </ModalContent>
    </Modal>
  );
}
