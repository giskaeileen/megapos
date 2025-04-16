import Select from 'react-select';
import IconPlus from "../../components/Icon/IconPlus";

// Komponen MemberSelector menerima props untuk daftar member, opsi terpilih, fungsi setter, pemicu modal tambah member, dan fungsi refetch
const MemberSelector = ({ members, selectedOption, setSelectedOption, showAddMemberModal, refetch }) => {
  // Mapping data members menjadi format yang sesuai dengan react-select
  const options = members?.data?.map((member) => ({
    value: member.id, // Nilai unik untuk masing-masing opsi
    label: member.name,  // Label utama yang ditampilkan
    email: member.email, // Email member (digunakan untuk pencarian dan tampilan)
    noTelp: member.phone, // Nomor telepon member
  })) || [];

  // Fungsi untuk memfilter opsi berdasarkan nama, email, atau nomor telepon (digunakan saat user mengetik di search box)
  const filterOptions = (option, inputValue) => {
    const searchText = inputValue.toLowerCase(); // Ubah input menjadi huruf kecil untuk pencocokan
    return (
      option?.data?.label?.toLowerCase().includes(searchText) || // Cek kecocokan pada nama
      option?.data?.email?.toLowerCase().includes(searchText) || // Cek kecocokan pada email
      option?.data?.noTelp?.toLowerCase().includes(searchText)  // Cek kecocokan pada nomor telepon
    );
  };

  // Custom tampilan label untuk setiap opsi yang ditampilkan
  const formatOptionLabel = ({ label, email, noTelp }) => (
    <div>
      <div>{label}</div> {/* Tampilkan nama */}
      <div style={{ fontSize: '12px', color: '#666' }}>
        {email} | {noTelp} {/* Tampilkan email dan nomor telepon */}
      </div>
    </div>
  );

  // Styling kustom untuk komponen react-select
  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "9999px", // Buat bentuk seperti pill
      padding: "5px 10px",  // Padding dalam kontrol input
      border: "1px solid #ccc", // Warna border default
      boxShadow: "none", // Hilangkan shadow
      "&:hover": { borderColor: "#888" }, // Warna border saat hover
    }),
    menu: (base) => ({ ...base, borderRadius: "10px" }), // Radius sudut untuk menu dropdown
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? "#f0f0f0" : "white", // Highlight saat opsi difokus
      color: "#333", // Warna teks
    }),
  };

  return (
    <div className="mt-2 mb-4 flex gap-2 items-center"> {/* Container wrapper */}
      <div className="w-full">
        <Select
          placeholder="Select Member" // Placeholder saat belum ada pilihan
          options={options} // Opsi yang ditampilkan
          filterOption={filterOptions} // Fungsi pencarian custom
          formatOptionLabel={formatOptionLabel} // Format label yang ditampilkan
          menuPlacement="top" // Tempat munculnya dropdown (di atas)
          styles={customStyles} // Styling kustom
          value={selectedOption} // Nilai terpilih
          onChange={setSelectedOption} // Event handler saat memilih opsi
          isClearable={true} // Opsi bisa dihapus
        />
      </div>
      <button 
        type="button" 
        className="btn btn-primary w-10 h-10 p-2.5 rounded-full" 
        onClick={showAddMemberModal} // Buka modal untuk menambah member baru
      >
        <IconPlus /> {/* Ikon */}
      </button>
    </div>
  );
};

export default MemberSelector;