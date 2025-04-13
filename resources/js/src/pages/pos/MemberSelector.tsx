import Select from 'react-select';
import IconPlus from "../../components/Icon/IconPlus";

const MemberSelector = ({ members, selectedOption, setSelectedOption, showAddMemberModal, refetch }) => {
  const options = members?.data?.map((member) => ({
    value: member.id,
    label: member.name,
    email: member.email,
    noTelp: member.phone,
  })) || [];

  const filterOptions = (option, inputValue) => {
    const searchText = inputValue.toLowerCase();
    return (
      option?.data?.label?.toLowerCase().includes(searchText) ||
      option?.data?.email?.toLowerCase().includes(searchText) ||
      option?.data?.noTelp?.toLowerCase().includes(searchText)
    );
  };

  const formatOptionLabel = ({ label, email, noTelp }) => (
    <div>
      <div>{label}</div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        {email} | {noTelp}
      </div>
    </div>
  );

  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "9999px",
      padding: "5px 10px",
      border: "1px solid #ccc",
      boxShadow: "none",
      "&:hover": { borderColor: "#888" },
    }),
    menu: (base) => ({ ...base, borderRadius: "10px" }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? "#f0f0f0" : "white",
      color: "#333",
    }),
  };

  return (
    <div className="mt-2 mb-4 flex gap-2 items-center">
      <div className="w-full">
        <Select
          placeholder="Select Member"
          options={options}
          filterOption={filterOptions}
          formatOptionLabel={formatOptionLabel}
          menuPlacement="top"
          styles={customStyles}
          value={selectedOption}
          onChange={setSelectedOption}
          isClearable={true}
        />
      </div>
      <button 
        type="button" 
        className="btn btn-primary w-10 h-10 p-2.5 rounded-full" 
        onClick={showAddMemberModal}
      >
        <IconPlus />
      </button>
    </div>
  );
};

export default MemberSelector;