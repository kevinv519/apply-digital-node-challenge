export interface ContentfulApiResponse {
  sys: {
    type: string;
  };
  total: number;
  skip: number;
  limit: number;
  items: Item[];
}

/**
 * Does not include all possible fields, only the ones that are of interest to our API
 */
interface Item {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
    revision: number;
  };
  fields: {
    sku: string;
    name: string;
    brand: string;
    model: string;
    category: string;
    color: string;
    price: number;
    currency: string;
    stock: number;
  };
}
