import FilterCard from '@/app/lib/components/filters/filterCard';
import { FilterObject } from '@/app/lib/types/definitions';

export default function AllFilters({
  filters,
  setFilters,
}: {
  filters: FilterObject[];
  setFilters: any;
}) {
  const removeFilter = (referenceValue) => {
    setFilters(
      filters.filter((filter) => filter.referenceValue !== referenceValue),
    );
  };

  return (
    <div className="flex w-full flex-wrap gap-2">
      {filters.map((filter) => {
        return (
          <FilterCard
            key={filter.referenceValue}
            filter={filter}
            removeFilter={removeFilter}
          />
        );
      })}
    </div>
  );
}
