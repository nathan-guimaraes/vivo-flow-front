export interface ProductivityInfoLike {
  date: Date;
  totalProtocols: number;
  totalProtocolsRef: number;
}

export class ProductivityInfo implements ProductivityInfoLike {
  date: Date;
  totalProtocols: number;
  totalProtocolsRef: number;

  constructor(item?: Partial<ProductivityInfoLike>) {
    this.date = !item?.date ? null : new Date(item.date);
    this.totalProtocols = item?.totalProtocols;
    this.totalProtocolsRef = item?.totalProtocolsRef;
  }
}
