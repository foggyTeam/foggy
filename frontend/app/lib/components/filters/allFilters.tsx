import FilterCard from '@/app/lib/components/filters/filterCard';
import { FilterSet } from '@/app/lib/types/definitions';

const renderFilterCards = (
  filterKey: keyof FilterSet,
  filters: FilterSet,
  removeFilter: any,
) => {
  return Array.from(filters[filterKey]).map((filterValue: string, index) => (
    <FilterCard
      key={`${filterKey}-${index}`}
      removeFilter={removeFilter}
      filterKey={filterKey}
      filterValue={filterValue}
    />
  ));
};

const renderLastChangeCard = (filters: FilterSet, removeFilter: any) => {
  return (
    filters.lastChange && (
      <FilterCard
        key="lastChange"
        removeFilter={removeFilter}
        filterKey="lastChange"
        filterValue={filters.lastChange}
      />
    )
  );
};

export default function AllFilters({
  filters,
  dispatchFilters,
}: {
  filters?: FilterSet;
  dispatchFilters: any;
}) {
  const removeFilter = (
    key: keyof FilterSet,
    value: FilterSet[keyof FilterSet],
  ) => {
    dispatchFilters({
      type: 'DELETE',
      payload: [
        {
          key: key,
          value: key === 'lastChange' ? value : new Set([value]),
        },
      ],
    });
  };

  return (
    <div className="flex w-full flex-wrap gap-2">
      {filters &&
        (Object.keys(filters) as (keyof FilterSet)[]).map(
          (filterKey: keyof FilterSet) =>
            filterKey === 'lastChange'
              ? renderLastChangeCard(filters, removeFilter)
              : renderFilterCards(filterKey, filters, removeFilter),
        )}
    </div>
  );
}
