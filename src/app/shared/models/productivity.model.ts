export interface ProductivityModelLike {
  id: number;
  quantityProductivity: number;
  tower: string;
  island: string;
  subisland: string;
  subject: string;
  negotiationType: string;
  segment: string;
  product: string;
}

export class ProductivityModel implements ProductivityModelLike {
  id: number;
  quantityProductivity: number;
  tower: string;
  island: string;
  subisland: string;
  subject: string;
  negotiationType: string;
  segment: string;
  product: string;

  constructor(item?: Partial<ProductivityModelLike>) {
    this.id = item?.id;
    this.quantityProductivity = item?.quantityProductivity;
    this.tower = item?.tower;
    this.island = item?.island;
    this.subisland = item?.subisland;
    this.subject = item?.subject;
    this.negotiationType = item?.negotiationType;
    this.segment = item?.segment;
    this.product = item?.product;
  }
}
