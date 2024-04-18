export interface Product {
  id: string;
  name: string;
  price: number;
  parcelamento: Array<number>;
  color: string;
  image: string;
  size: Array<string>;
  date: string;
}

export interface ItemColor {
  color: string
}

export interface ItemSize {
  size: string[];
}

export interface Cart {
  id: string;
  name: string;
  qtd: string;
  price: string;
  image: string;
}