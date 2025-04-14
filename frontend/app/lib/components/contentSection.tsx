'use client';

import {
  FilterObject,
  Project,
  ProjectMember,
  Team,
  TeamMember,
} from '@/app/lib/types/definitions';
import { ComponentType, useMemo, useState } from 'react';
import useFilteredData from '@/app/lib/hooks/useFilteredData';
import { Avatar } from '@heroui/avatar';
import ContentActionBar, {
  ActionBarProps,
} from '@/app/lib/components/contentActionBar';
import clsx from 'clsx';
import userStore from '@/app/stores/userStore';

interface ContentSectionProps {
  sectionTitle: string;
  sectionAvatar?: string;
  data: Project[] | Team[] | TeamMember[] | ProjectMember[]; // | Notification[];
  DataCard: ComponentType<any>;
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
    userStore.user?.id as string,
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
    <div className="flex h-full w-full flex-col gap-4 overflow-clip text-sm">
      <div className="flex flex-col gap-1">
        <div className="flex h-10 items-center justify-start gap-2">
          {sectionAvatar?.length && <Avatar size="md" src={sectionAvatar} />}
          <h1 className="font-medium">{sectionTitle}</h1>
        </div>

        <ContentActionBar {...actionBarProps} />
      </div>

      <div
        className={clsx(
          'relative h-full w-full flex-1 overflow-y-auto pt-0.5',
          'scrollbar-thin scrollbar-track-white/20 scrollbar-thumb-default-300',
          'scrollbar-track-rounded-full scrollbar-thumb-rounded-full',
        )}
      >
        <div
          className="grid-rows-auto grid content-between gap-y-2 pb-16"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, 97px)',
          }}
        >
          {filteredData.map((element) => (
            <DataCard key={element.id} {...element} />
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-50 h-16 bg-gradient-to-t from-default-50/50" />
    </div>
  );
}
