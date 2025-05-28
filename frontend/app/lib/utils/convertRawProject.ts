import {
  Board,
  Project,
  ProjectSection,
  RawProject,
} from '@/app/lib/types/definitions';
import { observable } from 'mobx';

export default function ConvertRawProject(rawProject: RawProject): Project {
  function convertSection(
    rawSections: any[],
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

    (rawSections || []).forEach((value: any) => {
      if (value && 'children' in value) {
        const childrenMap = convertSection(value.children || []);

        const projectSection: ProjectSection = {
          id: value.id,
          parentId: value.parentId || undefined,
          name: value.name,
          childrenNumber: value.childrenNumber || 0,
          children: childrenMap,
        };

        sectionMap.set(value.id, projectSection);
      } else if (value) {
        const board: Pick<
          Board,
          'id' | 'name' | 'sectionId' | 'type' | 'lastChange'
        > = {
          id: value.id,
          name: value.name,
          sectionId: value.sectionId,
          type: value.type?.toUpperCase(),
          lastChange: value.lastChange ?? value.updatedAt,
        };

        sectionMap.set(value.id, board);
      }
    });

    return sectionMap;
  }

  const sections = new Map<string, ProjectSection>();
  (rawProject.sections || []).forEach((section: any) => {
    const childrenMap = convertSection(section.children || []);

    const projectSection: ProjectSection = {
      id: section.id,
      parentId: section.parentId || undefined,
      name: section.name,
      childrenNumber: section.childrenNumber || 0,
      children: childrenMap,
    };

    sections.set(section.id, projectSection);
  });

  // TODO: parse via zod
  return {
    ...rawProject,
    lastChange: rawProject.updatedAt,
    sections,
  } as Project;
}
