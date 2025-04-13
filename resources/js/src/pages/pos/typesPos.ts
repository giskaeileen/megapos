export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  product_image?: string;
  discount_normal?: number;
  discount_member?: number;
  attribute?: Record<string, string>;
}

export interface MemberOption {
  value: string;
  label: string;
  email: string;
  noTelp: string;
}

export interface ProductOption {
  value: string;
  label: string;
  price: number;
  stock: number | null;
  sku: string;
  product_image?: string;
  selectedAttributes?: Record<string, string>;
}

export interface CartProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  dataCart: CartItem[];
  handleQtyChange: (item: CartItem, newQty: number) => void;
  storeId: string;
  customer: string | null;
  setCustomer: (customer: string | null) => void;
  setDataCart: (items: CartItem[]) => void;
  addPos: (product: ProductOption) => void;
}