export type ProductCategory = 'gundam' | 'pokemon' | 'onepiece' | (string & {});
export type GundamGrade = 'HG' | 'MG' | 'RG' | 'PG' | (string & {});
export type CardRarity = 'Common' | 'Rare' | 'Super Rare' | 'Ultra Rare' | (string & {});

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
  subCategoryKey?: string;
  subCategoryValue?: string;
  scale?: string;
  material?: string;
  cardType?: string;
  featured?: boolean;
}