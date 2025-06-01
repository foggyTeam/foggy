import { Autocomplete, AutocompleteItem } from '@heroui/autocomplete';
import clsx from 'clsx';
import { bg_container_no_padding } from '@/app/lib/types/styles';
import settingsStore from '@/app/stores/settingsStore';
import { CheckIcon, SearchIcon } from 'lucide-react';
import SmallMemberCard from '@/app/lib/components/members/smallMemberCard';
import React, { useEffect, useState } from 'react';
import { ProjectMember, Team } from '@/app/lib/types/definitions';
import FilterCard from '@/app/lib/components/filters/filterCard';
import { useInfiniteScroll } from '@heroui/use-infinite-scroll';
import { useMembersList } from '@/app/lib/hooks/useMembersList';

export default function MemberAutocomplete({
  setSelectedId,
}: {
  setSelectedId: (
    newId: ((prevState: string[]) => string[]) | string[],
  ) => void;
}) {
  const [selectedMembers, setSelectedMembers] = useState<
    Array<
      | Pick<ProjectMember, 'id' | 'nickname' | 'avatar'>
      | Pick<Team, 'id' | 'name' | 'avatar'>
    >
  >([]);
  const [inputValue, setInputValue] = useState('');

  const { membersList, isLoading, hasMore, onLoadMore } = useMembersList({
    inputValue,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [, scrollerRef] = useInfiniteScroll({
    hasMore,
    isEnabled: true,
    shouldUseLoader: false,
    onLoadMore,
  });

  const handleSelectionChange = (key: any | null) => {
    if (key) {
      let filtered = selectedMembers.filter((item) => item.id !== key);
      if (filtered.length < selectedMembers.length)
        setSelectedMembers(filtered);
      else
        setSelectedMembers((prev) => [
          ...prev,
          membersList.find((member) => member.id === key),
        ]);
      setIsOpen(true);
    }
  };

  useEffect(() => {
    setSelectedId(selectedMembers.map((member) => member.id));
    setInputValue('');
  }, [selectedMembers]);

  return (
    <div className="flex flex-col gap-2">
      <Autocomplete
        inputValue={inputValue}
        onInputChange={setInputValue}
        items={membersList}
        onSelectionChange={handleSelectionChange}
        selectedKeys={selectedMembers.map((member) => member.id)}
        radius="full"
        size="sm"
        variant="flat"
        type="text"
        className="w-full"
        classNames={{
          popoverContent: clsx(
            bg_container_no_padding,
            'p-2 sm:p-3 bg-opacity-90 border-default-500',
          ),
        }}
        listboxProps={{
          selectionMode: 'multiple',
          hideSelectedIcon: true,
        }}
        placeholder={settingsStore.t.members.addMember.searchPlaceholder}
        selectorIcon={<SearchIcon className="stroke-default-500" />}
        allowsCustomValue
        menuTrigger="input"
        scrollRef={scrollerRef}
        isLoading={isLoading}
        isVirtualized
        itemHeight={44}
        maxListboxHeight={200}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        aria-label="select-members"
      >
        {membersList.map(
          (member) =>
            (
              <AutocompleteItem
                key={member.id}
                textValue={'nickname' in member ? member.nickname : member.name}
              >
                <div className="flex w-full flex-nowrap items-center justify-between gap-2">
                  <SmallMemberCard
                    member={member}
                    teamLabel={'name' in member}
                  />
                  {selectedMembers.find(
                    (selectedMember) => selectedMember.id === member.id,
                  ) && <CheckIcon className="stroke-default-500" />}
                </div>
              </AutocompleteItem>
            ) as any,
        )}
      </Autocomplete>
      {!!selectedMembers.length && (
        <div className="flex w-full flex-wrap gap-2">
          {selectedMembers.map((item, index) => (
            <FilterCard
              key={index}
              filterKey={'nickname' in item ? 'nickname' : 'name'}
              filterValue={'nickname' in item ? item.nickname : item.name}
              removeFilter={() =>
                setSelectedMembers(
                  selectedMembers.filter((member) => member.id !== item.id),
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
