import IconSearch from "../../components/Icon/IconSearch";

// Tipe props yang akan diterima oleh komponen SearchBar
interface SearchBarProps {
  search: string; // Nilai input teks saat ini
  setSearch: (search: string) => void; // Fungsi untuk mengubah nilai input
}

/**
 * Komponen input pencarian (search bar) yang dapat digunakan di halaman daftar produk atau data.
 * Menggunakan input teks dan ikon search sebagai hiasan.
 */
const SearchBar: React.FC<SearchBarProps> = ({ search, setSearch }) => {

  return (
    // Wrapper input dengan posisi relatif agar tombol bisa diposisikan secara absolut di dalamnya
    <div className="relative">
      {/* Input teks untuk pencarian */}
      <input 
        type="text" // Tipe input adalah teks
        placeholder="Search..." // Placeholder sebagai petunjuk pengguna
        className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" // Styling input menggunakan class Tailwind
        value={search} // Nilai input dikontrol dari props
        onChange={(e) => setSearch(e.target.value)} // Ketika input berubah, panggil setSearch
      />
      
      {/* Tombol ikon pencarian di dalam input */}
      <button 
        type="button" // Tombol tidak melakukan submit form
        className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary" 
        // Posisi kanan/kiri tergantung arah teks (LTR/RTL)
        // Menggunakan translate agar vertikalnya pas di tengah input
        // Saat input difokuskan, ikon berubah warna jadi primary
      >
        <IconSearch className="mx-auto" /> {/* Ikon pencarian di tengah tombol */}
      </button>
    </div>
  );
};

export default SearchBar;