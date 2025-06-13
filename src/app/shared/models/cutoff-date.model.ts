export interface CutoffDateModelLike {
  id: number;
  tower: string;
  negotiationType: string;
  product: string;
  date: Date;
}

export class CutoffDateModel implements CutoffDateModelLike {
  id: number;
  tower: string;
  negotiationType: string;
  product: string;
  date: Date;

  constructor(item?: Partial<CutoffDateModelLike>) {
    this.id = item?.id;
    this.tower = item?.tower;
    this.negotiationType = item?.negotiationType;
    this.product = item?.product;
    this.date = !item?.date ? null : new Date(item.date);
  }
}
