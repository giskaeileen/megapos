import IconListCheck from "../../components/Icon/IconListCheck";
import IconLayoutGrid from "../../components/Icon/IconLayoutGrid";

// Tipe props yang diterima oleh komponen ViewToggle
interface ViewToggleProps {
  value: string; // Menyimpan tampilan yang sedang aktif ('list' atau 'grid')
  setValue: (value: string) => void; // Fungsi untuk mengubah tampilan yang aktif
}

// Komponen ViewToggle digunakan untuk mengganti tampilan antara daftar (list) dan grid
const ViewToggle: React.FC<ViewToggleProps> = ({ value, setValue }) => {

  return (
    <div className="flex gap-3">
      {/* button untuk memilih tampilan list */}
      <button 
        type="button" 
        className={`btn btn-outline-primary p-2 ${value === 'list' && 'bg-primary text-white'}`} 
        onClick={() => setValue('list')} // Saat diklik, set tampilan menjadi 'list'
      >
        <IconListCheck /> {/* Ikon tampilan list */}
      </button>
      {/* button untuk memilih tampilan grid */}
      <button 
        type="button" 
        className={`btn btn-outline-primary p-2 ${value === 'grid' && 'bg-primary text-white'}`} 
        onClick={() => setValue('grid')} // Saat diklik, set tampilan menjadi 'grid'
      >
        <IconLayoutGrid /> {/* Ikon tampilan grid */}
      </button>
    </div>
  );
};

export default ViewToggle;