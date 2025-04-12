'use client';

import {
  Project,
  ProjectMember,
  Team,
  TeamMember,
} from '@/app/lib/types/definitions';
import { useState } from 'react';
import useFilteredData from '@/app/lib/hooks/useFilteredData';
import { Avatar } from '@heroui/avatar';
import ContentActionBar from '@/app/lib/components/contentActionBar';

interface ContentSectionProps {
  sectionTitle: string;
  sectionAvatar?: string;
  data: Project[] | Team[] | TeamMember[] | ProjectMember[]; // | Notification[];
  DataCard: any;
  filter?: boolean;
  onlyFavorite?: boolean;
  onlyWithNotification?: boolean;
  addNew?: any;
  addMember?: any;
  openSettings?: any;
}

export default function ContentSection({
  sectionTitle,
  sectionAvatar,
  data,
  DataCard,
  filter,
  onlyFavorite,
  onlyWithNotification,
  addNew,
  addMember,
  openSettings,
}: ContentSectionProps) {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});
  const [favorite, setFavorite] = useState(false);
  const [withNotification, setWithNotification] = useState(false);

  const filteredData = useFilteredData(
    data,
    searchValue,
    filters,
    favorite,
    withNotification,
  );

  return (
    <div className="h-full w-full gap-4">
      <div className="flex h-10 items-center justify-start gap-2">
        {sectionAvatar?.length && <Avatar size="md" src={sectionAvatar} />}
        <h1 className="text-sm font-medium">{sectionTitle}</h1>
      </div>

      <ContentActionBar />

      <div className="flex flex-wrap">
        {filteredData.map((element) => (
          <p key={element.id}>
            {element.id} <DataCard />
          </p>
        ))}
      </div>
    </div>
  );
}
