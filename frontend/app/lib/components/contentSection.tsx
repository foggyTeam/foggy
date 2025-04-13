'use client';

import {
  FilterObject,
  Project,
  ProjectMember,
  Team,
  TeamMember,
} from '@/app/lib/types/definitions';
import { useMemo, useState } from 'react';
import useFilteredData from '@/app/lib/hooks/useFilteredData';
import { Avatar } from '@heroui/avatar';
import ContentActionBar, {
  ActionBarProps,
} from '@/app/lib/components/contentActionBar';

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
  const [filters, setFilters] = useState([] as FilterObject[]);
  const [favorite, setFavorite] = useState(false);
  const [withNotification, setWithNotification] = useState(false);

  const filteredData = useFilteredData(
    data,
    searchValue,
    filters,
    favorite,
    withNotification,
  );

  const openProjectFilters = () => {
    console.log('Project filters');
  };

  const actionBarProps = useMemo(() => {
    const props: ActionBarProps = {
      setSearchValue,
      addNew,
      addMember,
      openSettings,
    };

    if (filter) {
      props.openFilters = openProjectFilters;
      props.filters = filters;
      props.setFilters = setFilters;
    }
    if (onlyFavorite) {
      props.favorite = favorite;
      props.setFavorite = setFavorite;
    }
    if (onlyWithNotification) {
      props.withNotification = withNotification;
      props.setWithNotification = setWithNotification;
    }

    return props;
  }, [favorite, filters, withNotification]);

  return (
    <div className="flex h-full w-full flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1">
        <div className="flex h-10 items-center justify-start gap-2">
          {sectionAvatar?.length && <Avatar size="md" src={sectionAvatar} />}
          <h1 className="font-medium">{sectionTitle}</h1>
        </div>

        <ContentActionBar {...actionBarProps} />
      </div>
      <div className="flex flex-wrap">
        {filteredData.map((element) => (
          <p key={element.id}>
            {element.name} <DataCard />
          </p>
        ))}
      </div>
    </div>
  );
}
