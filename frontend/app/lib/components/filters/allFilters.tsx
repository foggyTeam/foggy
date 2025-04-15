import FilterCard from '@/app/lib/components/filters/filterCard';

const renderFilterCards = (filterKey, filters, removeFilter) => {
  return Array.from(filters[filterKey]).map((filterValue: string, index) => (
    <FilterCard
      key={`${filterKey}-${index}`}
      removeFilter={removeFilter}
      filterKey={filterKey}
      filterValue={filterValue}
    />
  ));
};

const renderLastChangeCard = (filters, removeFilter) => {
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

export default function AllFilters({ filters, setFilters }) {
  const removeFilter = (key, value) => {
    const newFilters = { ...filters };
    if (key !== 'lastChange') {
      newFilters[key] = new Set(newFilters[key]);
      newFilters[key].delete(value);
    } else {
      newFilters.lastChange = '';
    }
    setFilters(newFilters);
  };

  return (
    <div className="flex w-full flex-wrap gap-2">
      {Object.keys(filters).map((filterKey) =>
        filterKey === 'lastChange'
          ? renderLastChangeCard(filters, removeFilter)
          : renderFilterCards(filterKey, filters, removeFilter),
      )}
    </div>
  );
}
