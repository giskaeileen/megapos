import IconListCheck from "../../components/Icon/IconListCheck";
import IconLayoutGrid from "../../components/Icon/IconLayoutGrid";

interface ViewToggleProps {
  value: string;
  setValue: (value: string) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ value, setValue }) => {
  return (
    <div className="flex gap-3">
      <button 
        type="button" 
        className={`btn btn-outline-primary p-2 ${value === 'list' && 'bg-primary text-white'}`} 
        onClick={() => setValue('list')}
      >
        <IconListCheck />
      </button>
      <button 
        type="button" 
        className={`btn btn-outline-primary p-2 ${value === 'grid' && 'bg-primary text-white'}`} 
        onClick={() => setValue('grid')}
      >
        <IconLayoutGrid />
      </button>
    </div>
  );
};

export default ViewToggle;