'use client';

import {
  FilterSet,
  Project,
  ProjectMember,
  ProjectRole,
  Team,
  TeamMember,
} from '@/app/lib/types/definitions';
import { ComponentType, useMemo, useReducer, useState } from 'react';

import { Avatar } from '@heroui/avatar';
import ContentActionBar, {
  ActionBarProps,
} from '@/app/lib/components/contentActionBar';
import clsx from 'clsx';
import userStore from '@/app/stores/userStore';
import { useDisclosure } from '@heroui/modal';
import FilterModal from '@/app/lib/components/filters/filterModal';
import useFilteredData from '@/app/lib/hooks/useFilteredData';

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

export type FilterReducerActionPayload = {
  key: 'nickname' | 'team' | 'role' | 'lastChange';
  value: Set<string & ProjectRole> | string;
};
type FilterReducerAction =
  | { type: 'SET'; payload: FilterReducerActionPayload[] }
  | { type: 'DELETE'; payload: FilterReducerActionPayload[] }
  | { type: 'RESET' };

function filtersReducer(state, action: FilterReducerAction) {
  const newFilters: FilterSet = { ...state };
  switch (action.type) {
    case 'SET':
      action.payload.forEach((payload) => {
        newFilters[payload.key] = payload.value;
      });
      return newFilters;
    case 'DELETE':
      action.payload.forEach((payload) => {
        if (payload.key !== 'lastChange')
          payload.value.forEach((value) =>
            newFilters[payload.key].delete(value),
          );
        else newFilters[payload.key] = '';
      });
      return newFilters;
    case 'RESET':
      return new FilterSet();
    default:
      console.error('An error while setting filters. Resetting');
      return new FilterSet();
  }
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
  const [filters, dispatchFilters] = useReducer(
    filtersReducer,
    new FilterSet(),
  );
  const [favorite, setFavorite] = useState(false);
  const [withNotification, setWithNotification] = useState(false);
  const {
    isOpen: isFiltersOpen,
    onOpen: onFiltersOpen,
    onOpenChange: onFiltersOpenChange,
  } = useDisclosure();

  const filteredData = useFilteredData(
    data,
    searchValue,
    filters,
    favorite,
    withNotification,
    userStore.user?.id as string,
  );

  const actionBarProps = useMemo(() => {
    const props: ActionBarProps = {
      setSearchValue,
      addNew,
      addMember,
      openSettings,
    };

    if (filter) {
      props.openFilters = onFiltersOpen;
      props.dispatchFilters = dispatchFilters;
    }
    if (onlyFavorite) props.setFavorite = setFavorite;

    if (onlyWithNotification) props.setWithNotification = setWithNotification;

    return props;
  }, [
    setSearchValue,
    addNew,
    addMember,
    openSettings,
    filter,
    onFiltersOpen,
    dispatchFilters,
    onlyFavorite,
    setFavorite,
    onlyWithNotification,
    setWithNotification,
  ]);

  return (
    <>
      <div className="flex h-full w-full flex-col gap-2 overflow-clip text-sm">
        <div className="flex flex-col gap-1">
          <div className="flex h-10 items-center justify-start gap-2">
            {sectionAvatar?.length && <Avatar size="md" src={sectionAvatar} />}
            <h1 className="font-medium">{sectionTitle}</h1>
          </div>

          <ContentActionBar
            filters={filters}
            favorite={favorite}
            withNotification={withNotification}
            {...actionBarProps}
          />
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

      {isFiltersOpen && (
        <FilterModal
          data={data}
          filters={filters}
          dispatchFilters={dispatchFilters}
          isOpen={isFiltersOpen}
          onOpenChange={onFiltersOpenChange}
        />
      )}
    </>
  );
}
