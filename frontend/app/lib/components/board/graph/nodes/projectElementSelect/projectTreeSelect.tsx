'use client';

import projectsStore from '@/app/stores/projectsStore';
import { GetSection } from '@/app/lib/server/actions/projectServerActions';
import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';
import React, { createContext, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import SubSectionCardSelect from '@/app/lib/components/board/graph/nodes/projectElementSelect/subSectionCardSelect';
import { GInternalLinkNode } from '@/app/lib/types/definitions';

type ElementType = GInternalLinkNode['data']['element'] | undefined;
interface SelectProjectElementContextType {
  path: Set<string>;
  selectedId: string | null;
  loadSection: (id: string, parentList: string[]) => void;
  onSelect: (selected: ElementType) => void;
}
const SelectElementContext =
  createContext<SelectProjectElementContextType | null>(null);
export const useSelectElementContext = () => {
  const context = useContext(SelectElementContext);
  if (!context)
    throw new Error(
      'useSelectElementContext must be used within a SelectElementContextProvider',
    );
  return context;
};

const ProjectTreeSelect = observer(
  ({
    selectedPath,
    onSelect,
  }: {
    selectedPath: string[];
    onSelect: (selected: ElementType) => void;
  }) => {
    const pathSet = useMemo(() => new Set(selectedPath), [selectedPath]);
    const selectedId = useMemo(
      () =>
        selectedPath.length ? selectedPath[selectedPath.length - 1] : null,
      [selectedPath],
    );

    const loadSection = async (id: string, parentList: string[]) => {
      if (!projectsStore.activeProject) return;
      try {
        const result = await GetSection(projectsStore.activeProject.id, id);

        projectsStore.insertProjectChild(parentList, result);
      } catch (e: any) {
        addToast({
          color: 'danger',
          severity: 'danger',
          title: settingsStore.t.toasts.project.getSectionError,
        });
      }
    };

    return (
      <SelectElementContext.Provider
        value={{
          path: pathSet,
          selectedId,
          loadSection: loadSection,
          onSelect,
        }}
      >
        <div className="flex h-fit w-full flex-col gap-2 pr-2 pb-2">
          {projectsStore.activeProject?.sections &&
            Array.from(projectsStore.activeProject?.sections?.values()).map(
              (section) => (
                <SubSectionCardSelect
                  parentList={[]}
                  key={section.id}
                  id={section.id}
                />
              ),
            )}
        </div>
      </SelectElementContext.Provider>
    );
  },
);

export default ProjectTreeSelect;
