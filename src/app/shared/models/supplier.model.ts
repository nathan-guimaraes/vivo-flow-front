export interface SupplierModelLike {
  id: number;
  name: string;
}

export class SupplierModel implements SupplierModelLike {
  id: number;
  name: string;

  constructor(item?: Partial<SupplierModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
  }
}

export interface SupplierDetailsModelLike extends SupplierModelLike {
  active: boolean;
}

export class SupplierDetailsModel
  extends SupplierModel
  implements SupplierDetailsModelLike
{
  active: boolean;

  constructor(item?: Partial<SupplierDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
  }
}
