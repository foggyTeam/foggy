import {
  Board,
  Project,
  ProjectSection,
  RawProject,
} from '@/app/lib/types/definitions';
import { observable } from 'mobx';

export function ConvertRawSection(rawSection: any): ProjectSection {
  function convertChildren(
    rawChildren: any[],
  ): Map<
    string,
    | ProjectSection
    | Pick<Board, 'id' | 'name' | 'sectionId' | 'type' | 'lastChange'>
  > {
    const childMap = observable.map<
      string,
      | ProjectSection
      | Pick<Board, 'id' | 'name' | 'sectionId' | 'type' | 'lastChange'>
    >();

    (rawChildren || []).forEach((child: any) => {
      if (child && 'children' in child) {
        // Рекурсивно парсим вложенную секцию
        childMap.set(child.id, ConvertRawSection(child));
      } else if (child) {
        // Это доска
        childMap.set(child.id, {
          id: child.id,
          name: child.name,
          sectionId: child.sectionId,
          type: child.type?.toUpperCase(),
          lastChange: child.lastChange ?? child.updatedAt,
        });
      }
    });

    return childMap;
  }

  return {
    id: rawSection.id,
    parentId: rawSection.parentId || undefined,
    name: rawSection.name,
    childrenNumber: rawSection.childrenNumber || 0,
    children: convertChildren(rawSection.children || []),
  };
}

export default function ConvertRawProject(rawProject: RawProject): Project {
  const sections = new Map<string, ProjectSection>();
  (rawProject.sections || []).forEach((section: any) => {
    sections.set(section.id, ConvertRawSection(section));
  });

  // TODO: parse via zod
  return {
    ...rawProject,
    lastChange: rawProject.updatedAt,
    sections,
  } as Project;
}
