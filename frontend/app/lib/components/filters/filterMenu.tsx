export function checkFilters(filters): boolean {
  const filtersKeys = Object.keys(filters);
  if (filtersKeys.length) {
    // return false
  }
  return true;
}

export default function FilterMenu({ filters, setFilters }) {
  return <p>I am a filter</p>;
}
