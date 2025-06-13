export interface ProductModelLike {
  id: number;
  name: string;
  towerId: number;
}

export class ProductModel implements ProductModelLike {
  id: number;
  name: string;
  towerId: number;

  constructor(item?: Partial<ProductModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
    this.towerId = item?.towerId;
  }
}

export interface ProductDetailsModelLike extends ProductModelLike {
  active: boolean;
  tower: string;
}

export class ProductDetailsModel
  extends ProductModel
  implements ProductDetailsModelLike
{
  active: boolean;
  tower: string;

  constructor(item?: Partial<ProductDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
    this.tower = item?.tower;
  }
}
