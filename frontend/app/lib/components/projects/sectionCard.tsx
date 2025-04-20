import { ProjectSection } from '@/app/lib/types/definitions';

export default function SectionCard({ section }: { section: ProjectSection }) {
  return <p>{section.name}</p>;
}
