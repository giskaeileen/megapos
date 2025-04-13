import IconSearch from "../../components/Icon/IconSearch";

interface SearchBarProps {
  search: string;
  setSearch: (search: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, setSearch }) => {
  return (
    <div className="relative">
      <input 
        type="text" 
        placeholder="Search..." 
        className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
      />
      <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
        <IconSearch className="mx-auto" />
      </button>
    </div>
  );
};

export default SearchBar;