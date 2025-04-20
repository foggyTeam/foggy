import {
  Board,
  Project,
  ProjectSection,
  RawProject,
} from '@/app/lib/types/definitions';
import { observable } from 'mobx';

export default function ConvertRawProject(rawProject: RawProject): Project {
  function convertSection(
    rawSection: Record<string, any>,
  ): Map<
    string,
    | ProjectSection
    | Pick<Board, 'id' | 'name' | 'sectionId' | 'type' | 'lastChange'>
  > {
    const sectionMap = observable.map(
      new Map<
        string,
        | ProjectSection
        | Pick<Board, 'id' | 'name' | 'sectionId' | 'type' | 'lastChange'>
      >(),
    );

    Object.entries(rawSection).forEach(([key, value]) => {
      if ('children' in value) {
        const childrenMap = convertSection(value.children);

        const projectSection: ProjectSection = {
          id: value.id,
          parentId: value.parentId || undefined,
          name: value.name,
          childrenNumber: value.childrenNumber || 0,
          children: childrenMap,
        };

        sectionMap.set(key, projectSection);
      } else {
        const board: Pick<
          Board,
          'id' | 'name' | 'sectionId' | 'type' | 'lastChange'
        > = {
          id: value.id,
          name: value.name,
          sectionId: value.sectionId,
          type: value.type,
          lastChange: value.lastChange,
        };

        sectionMap.set(key, board);
      }
    });

    return sectionMap;
  }

  const sections = new Map<string, ProjectSection>();
  Object.entries(rawProject.sections).forEach(([key, value]) => {
    const childrenMap = convertSection(value.children || {});

    const projectSection: ProjectSection = {
      id: value.id,
      parentId: value.parentId || undefined,
      name: value.name,
      childrenNumber: value.childrenNumber || 0,
      children: childrenMap,
    };

    sections.set(key, projectSection);
  });

  return {
    ...rawProject,
    sections,
  };
}
