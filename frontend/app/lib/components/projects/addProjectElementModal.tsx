import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import React, { ReactNode, useEffect, useState } from 'react';
import { Tab, Tabs } from '@heroui/tabs';
import { ProjectElementTypes } from '@/app/lib/types/definitions';
import ElementIcon from '@/app/lib/components/menu/leftSideBar/elementIcon';
import settingsStore from '@/app/stores/settingsStore';
import { Input, Textarea } from '@heroui/input';
import { Button } from '@heroui/button';
import IsFormValid from '@/app/lib/utils/isFormValid';
import { projectElementNameSchema } from '@/app/lib/types/schemas';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';
import { Checkbox } from '@heroui/checkbox';
import { Divider } from '@heroui/divider';

export default function AddProjectElementModal({
  isOpen,
  onOpenChange,
  action,
  boardOnly = false,
  sectionOnly = false,
}: {
  isOpen: boolean;
  onOpenChange: any;
  action: (
    nodeName: string,
    nodeType: ProjectElementTypes,
    needsTemplate?: boolean,
    prompt?: string,
  ) => void;
  boardOnly?: boolean;
  sectionOnly?: boolean;
}) {
  const { smallerSize } = useAdaptiveParams();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState<string>('');
  const [generateTemplate, setGenerateTemplate] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');

  const [error, setError] = useState({} as any);
  const [filetype, setFiletype] = useState<ProjectElementTypes>(
    sectionOnly ? 'SECTION' : 'SIMPLE',
  );
  const disabledKeys: ProjectElementTypes[] = boardOnly
    ? ['SECTION']
    : sectionOnly
      ? ['SIMPLE', 'GRAPH', 'DOC']
      : [];
  const filetypeTabs: ProjectElementTypes[] = [
    'SECTION',
    'SIMPLE',
    'GRAPH',
    'DOC',
  ];

  useEffect(() => {
    IsFormValid({ name, prompt }, projectElementNameSchema, setError);
  }, [name, prompt, setError]);

  useEffect(() => {
    if (!!prompt) setGenerateTemplate(true);
  }, [prompt]);

  return (
    <Modal
      data-testid="add-project-element-modal"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      onKeyDown={async (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' && !error?.name) {
          setIsLoading(true);
          await action(name, filetype, generateTemplate, prompt);
          setIsLoading(false);
        }
      }}
    >
      <ModalContent className="flex w-full max-w-lg gap-2 overflow-visible p-6 pt-0">
        {() =>
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
                  size={smallerSize}
                >
                  {filetypeTabs.map((filetype) => (
                    <Tab
                      data-testid={`${filetype.toLowerCase()}-btn`}
                      key={filetype}
                      title={<ElementIcon elementType={filetype} />}
                    />
                  ))}
                </Tabs>
              </ModalHeader>
              <ModalBody className="flex h-fit w-full max-w-lg flex-col gap-4 pt-6">
                <h1 className="font-medium">
                  {
                    settingsStore.t.projects.addElement[
                      filetype.toLowerCase() as
                        | 'section'
                        | 'simple'
                        | 'graph'
                        | 'doc'
                    ].new
                  }
                </h1>
                <Input
                  value={name}
                  autoFocus
                  onValueChange={setName}
                  isInvalid={error.name}
                  errorMessage={error.name}
                  radius="full"
                  size={smallerSize}
                  type="text"
                  className="m-0 w-full p-0"
                  classNames={{
                    inputWrapper: 'sm:text-sm text-medium',
                    input: 'sm:text-sm text-medium',
                  }}
                  placeholder={
                    settingsStore.t.projects.addElement[
                      filetype.toLowerCase() as
                        | 'section'
                        | 'simple'
                        | 'graph'
                        | 'doc'
                    ].placeholder
                  }
                />

                {filetype !== 'SECTION' && (
                  <>
                    <Divider />

                    <div className="flex flex-col gap-4">
                      <Checkbox
                        data-testid="generate-template-chb"
                        className="w-full"
                        isSelected={generateTemplate}
                        onValueChange={setGenerateTemplate}
                        size={smallerSize}
                      >
                        {
                          settingsStore.t.projects.addElement.template
                            .generateTemplate
                        }
                      </Checkbox>
                      <Textarea
                        isInvalid={error.prompt}
                        errorMessage={error.prompt}
                        maxRows={10}
                        label={
                          settingsStore.t.projects.addElement.template.prompt
                            .label
                        }
                        labelPlacement="inside"
                        name="prompt"
                        placeholder={
                          settingsStore.t.projects.addElement.template.prompt
                            .placeholder
                        }
                        type="prompt"
                        autoComplete="prompt"
                        size={smallerSize}
                        value={prompt}
                        onValueChange={setPrompt}
                        classNames={{
                          inputWrapper: 'bg-[hsl(var(--heroui-background))]',
                        }}
                      />
                    </div>
                  </>
                )}

                <Button
                  data-testid="create-btn"
                  onPress={async () => {
                    setIsLoading(true);
                    await action(name, filetype, generateTemplate, prompt);
                    setIsLoading(false);
                  }}
                  isDisabled={error.name}
                  color="primary"
                  isLoading={isLoading}
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
