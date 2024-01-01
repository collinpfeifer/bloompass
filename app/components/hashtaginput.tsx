import {
  useCombobox,
  Pill,
  Combobox,
  Group,
  CheckIcon,
  PillsInput,
} from '@mantine/core';
import { useCounter } from '@mantine/hooks';
import { Hashtag } from '@prisma/client';
import { useState } from 'react';

export default function HashtagInput({
  hashtags,
  selected,
  setSelected,
  error,
}: {
  selected: Hashtag[];
  setSelected: React.Dispatch<React.SetStateAction<Hashtag[]>>;
  hashtags: Hashtag[];
  error: string | null | undefined;
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const [search, setSearch] = useState<string>('');
  const [data, setData] = useState<Hashtag[]>(hashtags);
  const [count, handlers] = useCounter(1, { min: 1 });

  const exactOptionMatch = data.some((item: Hashtag) => item.title === search);

  const handleValueSelect = (val: string) => {
    setSearch('');

    if (val === '$create') {
      setData((current: Hashtag[]) => [
        ...current,
        {
          id: `new_${count}`,
          title: search,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      setSelected((current) => [
        ...current,
        {
          id: `new_${count}`,
          title: search,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      handlers.increment();
    } else {
      setSelected((current) => {
        const hashtag = data.find((item) => item.title === val);
        if (hashtag) return [...current, hashtag];
        else return current;
      });
    }
  };

  const handleValueRemove = (val: Hashtag) =>
    setSelected((current) => current.filter((v) => v.title !== val.title));

  const values = selected.map((item: Hashtag) => (
    <Pill
      key={item.id}
      withRemoveButton
      onRemove={() => handleValueRemove(item)}>
      {item.title}
    </Pill>
  ));

  const options = data
    .filter((item) =>
      item.title.toLowerCase().includes(search.trim().toLowerCase())
    )
    .map((item) => (
      <Combobox.Option
        value={item.title}
        key={item.id}
        active={selected.includes(item)}>
        <Group gap='sm'>
          {selected.includes(item) ? <CheckIcon size={12} /> : null}
          <span>{item.title}</span>
        </Group>
      </Combobox.Option>
    ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={false}>
      <Combobox.DropdownTarget>
        <PillsInput
          onClick={() => combobox.openDropdown()}
          error={error}
          withAsterisk
          label='Hashtags'>
          <Pill.Group>
            {values}
            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder='Search values'
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace' && search.length === 0) {
                    event.preventDefault();
                    handleValueRemove(selected[selected.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options}

          {!exactOptionMatch && search.trim().length > 0 && (
            <Combobox.Option value='$create'>+ Create {search}</Combobox.Option>
          )}

          {exactOptionMatch &&
            search.trim().length > 0 &&
            options.length === 0 && (
              <Combobox.Empty>Nothing found</Combobox.Empty>
            )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
