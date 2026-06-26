import Select from 'react-select';

const SelectTeamDropdown = ({
  teams = [],
  onChange,
  placeholder = 'Select Team',
  selectedTeam,
  enterpriseId,
  showAllTeamsOption = true,
  isDisabled = false,
}) => {
  const teamOptions =
    teams?.map((team) => ({
      value: team?.team_id,
      label: team?.team_name,
      displayLabel: team?.team_id,
    })) || [];

  // Add "All Teams" option if enabled
  const allTeamsOption = {
    value: 'all',
    label: 'All Teams',
    displayLabel: 'All Teams',
  };

  const selectOptions = showAllTeamsOption
    ? [allTeamsOption, ...teamOptions]
    : teamOptions;

  const selectedValue = selectedTeam
    ? selectOptions.find(
        (option) =>
          option.value === (selectedTeam === 'all' ? 'all' : selectedTeam)
      ) || null
    : null;

  const handleChange = (selectedOption) => {
    if (!selectedOption) {
      onChange?.(null);
      return;
    }

    // If "All Teams" is selected, pass 'all' as the value
    if (selectedOption.value === 'all') {
      onChange?.('all');
    } else {
      // If a single team is selected, pass the team_id
      onChange?.(selectedOption.value);
    }
  };

  const CustomOption = ({ children, ...props }) => {
    const isAllTeams = props.data.value === 'all';

    return (
      <div
        {...props.innerProps}
        className={`flex cursor-pointer items-center p-3 hover:bg-gray-100 ${
          props?.isSelected ? 'bg-blue-50' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              props?.isSelected ? 'text-blue-700' : 'text-gray-700'
            }`}
          >
            {isAllTeams ? children : props?.data?.label}
          </span>
          {!isAllTeams && (
            <span className="ml-2 text-sm text-gray-500">
              {props?.data?.displayLabel}
            </span>
          )}
        </div>
      </div>
    );
  };

  const DropdownIndicator = () => {
    return (
      <div className="px-2">
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="#6B7280"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="relative">
      <Select
        options={selectOptions}
        value={selectedValue}
        onChange={handleChange}
        onMenuOpen={() => {}}
        onMenuClose={() => {}}
        components={{
          Option: CustomOption,
          DropdownIndicator,
          IndicatorSeparator: () => null,
        }}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable={true}
        isSearchable={true}
        classNamePrefix="team-select"
        noOptionsMessage={() => 'No teams found'}
        classNames={{
          control: (state) =>
            `min-h-[50px] bg-white rounded-lg border-2 hover:border-gray-300 p-2 cursor-pointer ${
              state.isFocused
                ? 'border-black ring-2 ring-black-200'
                : 'border-black'
            } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`,
          valueContainer: () => 'p-1',
          singleValue: () => 'text-gray-700 text-sm font-medium',
          menu: () =>
            'mt-1 shadow-lg rounded-lg border border-gray-200 bg-white',
          option: (state) =>
            `p-3 cursor-pointer ${
              state.isSelected
                ? 'bg-black-50 text-black-700'
                : state.isFocused
                  ? 'bg-gray-50 text-gray-700'
                  : 'text-gray-700'
            }`,
        }}
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: 'black',
            boxShadow: state.isFocused
              ? '0 0 0 0.2px rgba(0, 0, 0, 0.2)'
              : 'none',
            '&:hover': {
              borderColor: 'black',
            },
          }),
        }}
      />
    </div>
  );
};

export default SelectTeamDropdown;
