// Interface untuk item yang ada di keranjang belanja (cart)
export interface CartItem {
  id: string; // ID unik produk atau variasi produk
  name: string; // Nama produk
  price: number; // Harga per item (sudah termasuk diskon jika ada)
  qty: number; // Jumlah produk yang dibeli
  product_image?: string; // URL gambar produk (opsional)
  discount_normal?: number; // Diskon umum yang berlaku (dalam persen, opsional)
  discount_member?: number; // Diskon khusus member (dalam persen, opsional)
  attribute?: Record<string, string>; // Atribut variasi produk (contoh: warna, ukuran), dalam bentuk key-value
}

// Interface untuk opsi customer/member yang dipilih dari dropdown
export interface MemberOption {
  value: string; // Nilai unik yang digunakan untuk memilih member (biasanya ID)
  label: string; // Nama yang ditampilkan dalam dropdown
  email: string; // Email member (jika tersedia)
  noTelp: string; // Nomor telepon member
}

// Interface untuk data produk yang ditampilkan sebagai opsi dalam dropdown pencarian
export interface ProductOption {
  value: string; // ID unik variasi atau produk
  label: string; // Nama produk + atribut (contoh: "Kaos - Merah, XL")
  price: number; // Harga jual
  stock: number | null; // Jumlah stok yang tersedia (null jika tidak diketahui)
  sku: string; // Kode unik produk (SKU)
  product_image?: string; // URL gambar produk (opsional)
  selectedAttributes?: Record<string, string>; // Atribut terpilih dari produk variasi
}

// Props untuk komponen keranjang belanja (Cart Sidebar)
export interface CartProps {
  isOpen: boolean; // Status apakah sidebar keranjang sedang dibuka
  toggleSidebar: () => void; // Fungsi untuk membuka/menutup sidebar
  dataCart: CartItem[]; // Daftar item yang sedang ada di keranjang
  handleQtyChange: (item: CartItem, newQty: number) => void; // Fungsi untuk mengubah jumlah item
  storeId: string; // ID toko saat ini
  customer: string | null; // ID atau nama customer yang sedang dipilih
  setCustomer: (customer: string | null) => void; // Fungsi untuk menetapkan customer yang dipilih
  setDataCart: (items: CartItem[]) => void; // Fungsi untuk mengatur ulang isi keranjang
  addPos: (product: ProductOption) => void; // Fungsi untuk menambahkan produk ke dalam keranjang
}
