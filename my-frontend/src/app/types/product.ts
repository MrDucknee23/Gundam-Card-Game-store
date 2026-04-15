export type ProductCategory = 'gundam' | 'pokemon' | 'onepiece';
export type GundamGrade = 'HG' | 'MG' | 'RG' | 'PG';
export type CardRarity = 'Common' | 'Rare' | 'Super Rare' | 'Ultra Rare';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  stock: number;
  images: string[];
  grade?: GundamGrade;
  rarity?: CardRarity;
  scale?: string;
  material?: string;
  cardType?: string;
  featured?: boolean;
}