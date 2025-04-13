export default function AllFilters({
  filters,
  setFilters,
}: {
  filters: any[];
  setFilters: any;
}) {
  return (
    <div className="flex w-full flex-wrap gap-2">
      {Object.keys(filters).map((filterKey) => {
        const filter = filters[filterKey];
        return <p key={filterKey}>{filterKey}</p>;
      })}
    </div>
  );
}
