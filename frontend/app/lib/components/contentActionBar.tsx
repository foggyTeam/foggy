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
import CheckAccess from '@/app/lib/utils/checkAccess';
import useAdaptiveParams from '@/app/lib/hooks/useAdaptiveParams';

export interface ActionBarProps {
  setSearchValue: any;
  filters?: FilterSet;
  filtersDisabled?: boolean;
  dispatchFilters?: any;
  openFilters?: any;
  favorite?: any;
  setFavorite?: any;
  withNotification?: any;
  setWithNotification?: any;
  addNew?: any;
  addMember?: any;
  openSettings?: any;
  type?: 'project' | 'team';
}

export default function ContentActionBar({
  setSearchValue,
  filters,
  dispatchFilters,
  openFilters,
  filtersDisabled,
  favorite,
  setFavorite,
  withNotification,
  setWithNotification,
  addNew,
  addMember,
  openSettings,
  type,
}: ActionBarProps) {
  const { smallerSize } = useAdaptiveParams();
  const hasFilters = () => {
    return [
      filters?.role?.size,
      filters?.team?.size,
      filters?.nickname?.size,
      filters?.lastChange?.length,
    ].some((size) => !!size);
  };
  return (
    <div className="flex h-fit w-full flex-col gap-2">
      <div className="flex h-fit w-full items-start justify-between gap-1 sm:items-center">
        <div className="flex flex-wrap items-center gap-1 sm:flex-nowrap">
          <Input
            onValueChange={setSearchValue}
            placeholder={settingsStore.t.main.searchPlaceholder}
            radius="full"
            size={smallerSize}
            variant="flat"
            type="text"
            className="m-0 w-full p-0 sm:max-w-64"
            classNames={{
              inputWrapper:
                'shadow-none text-sm bg-[hsl(var(--heroui-background))]',
              input: 'text-sm',
            }}
            endContent={<SearchIcon className="stroke-default-500" />}
          />
          {dispatchFilters !== undefined && (
            <Button
              isDisabled={filtersDisabled}
              onPress={openFilters}
              isIconOnly
              variant={hasFilters() ? 'flat' : 'light'}
              color={hasFilters() ? 'primary' : 'default'}
              size={smallerSize}
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
              size={smallerSize}
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
              size={smallerSize}
            >
              <BellIcon
                className={
                  withNotification ? 'stroke-primary-500' : 'stroke-default-300'
                }
              />
            </Button>
          )}
        </div>

        <div className="flex h-fit gap-1">
          {addNew !== undefined &&
            (type ? CheckAccess(['admin', 'owner'], type) : true) && (
              <Button
                onPress={addNew}
                isIconOnly
                variant="light"
                size={smallerSize}
              >
                <PlusIcon className="stroke-default-500" />
              </Button>
            )}
          {addMember !== undefined && CheckAccess(['admin', 'owner'], type) && (
            <Button
              onPress={addMember}
              isIconOnly
              variant="light"
              size={smallerSize}
            >
              <UserRoundPlusIcon className="stroke-default-500" />
            </Button>
          )}
          {openSettings !== undefined &&
            CheckAccess(['admin', 'owner'], type) && (
              <Button
                onPress={openSettings}
                isIconOnly
                variant="light"
                size={smallerSize}
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
