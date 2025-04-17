import { Input } from '@heroui/input';
import settingsStore from '@/app/stores/settingsStore';
import {
  BellIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  UserRoundPlusIcon,
} from 'lucide-react';
import { Button } from '@heroui/button';
import FunnelIcon from '@/app/lib/components/svg/funnelIcon';
import AllFilters from '@/app/lib/components/filters/allFilters';
import { FilterSet } from '@/app/lib/types/definitions';

export interface ActionBarProps {
  setSearchValue: any;
  filters?: FilterSet;
  dispatchFilters?: any;
  openFilters?: any;
  favorite?: any;
  setFavorite?: any;
  withNotification?: any;
  setWithNotification?: any;
  addNew?: any;
  addMember?: any;
  openSettings?: any;
}

export default function ContentActionBar({
  setSearchValue,
  filters,
  dispatchFilters,
  openFilters,
  favorite,
  setFavorite,
  withNotification,
  setWithNotification,
  addNew,
  addMember,
  openSettings,
}: ActionBarProps) {
  const hasFilters = () => {
    return [
      filters?.role?.size,
      filters?.team?.size,
      filters?.nickname?.size,
      filters?.lastChange?.length,
    ].some((size) => size as boolean);
  };
  return (
    <div className="flex h-fit w-full flex-col gap-2">
      <div className="flex h-fit w-full items-center justify-between gap-2">
        <div className="flex gap-1">
          <Input
            onValueChange={setSearchValue}
            placeholder={settingsStore.t.main.searchPlaceholder}
            radius="full"
            size="sm"
            variant="flat"
            type="text"
            className="m-0 max-w-64 p-0"
            classNames={{
              inputWrapper: 'shadow-none text-sm bg-white',
              input: 'text-sm',
            }}
            endContent={<SearchIcon className="stroke-default-500" />}
          />
          {dispatchFilters !== undefined && (
            <Button
              onPress={openFilters}
              isIconOnly
              variant={hasFilters() ? 'flat' : 'light'}
              color={hasFilters() ? 'primary' : 'default'}
              size="sm"
              radius="lg"
            >
              <FunnelIcon
                className={
                  hasFilters() ? 'stroke-primary-500' : 'stroke-default-300'
                }
              />
            </Button>
          )}
          {setFavorite !== undefined && (
            <Button
              onPress={() => setFavorite(!favorite)}
              isIconOnly
              variant={favorite ? 'flat' : 'light'}
              color={favorite ? 'primary' : 'default'}
              size="sm"
              radius="lg"
            >
              <StarIcon
                className={
                  favorite ? 'stroke-primary-500' : 'stroke-default-300'
                }
              />
            </Button>
          )}
          {setWithNotification !== undefined && (
            <Button
              onPress={() => setWithNotification(!withNotification)}
              isIconOnly
              variant={withNotification ? 'flat' : 'light'}
              color={withNotification ? 'primary' : 'default'}
              size="sm"
              radius="lg"
            >
              <BellIcon
                className={
                  withNotification ? 'stroke-primary-500' : 'stroke-default-300'
                }
              />
            </Button>
          )}
        </div>
        <div className="flex gap-1">
          {addNew !== undefined && (
            <Button
              onPress={addNew}
              isIconOnly
              variant="light"
              size="sm"
              radius="lg"
            >
              <PlusIcon className="stroke-default-500" />
            </Button>
          )}
          {addMember !== undefined && (
            <Button
              onPress={addMember}
              isIconOnly
              variant="light"
              size="sm"
              radius="lg"
            >
              <UserRoundPlusIcon className="stroke-default-500" />
            </Button>
          )}
          {openSettings !== undefined && (
            <Button
              onPress={openSettings}
              isIconOnly
              variant="light"
              size="sm"
              radius="lg"
            >
              <SettingsIcon className="stroke-default-500" />
            </Button>
          )}
        </div>
      </div>
      {dispatchFilters !== undefined && (
        <AllFilters filters={filters} dispatchFilters={dispatchFilters} />
      )}
    </div>
  );
}
