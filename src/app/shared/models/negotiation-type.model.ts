export interface NegotiationTypeModelLike {
  id: number;
  name: string;
  towerId: number;
}

export class NegotiationTypeModel implements NegotiationTypeModelLike {
  id: number;
  name: string;
  towerId: number;

  constructor(item?: Partial<NegotiationTypeModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
    this.towerId = item?.towerId;
  }
}

export interface NegotiationTypeDetailsModelLike extends NegotiationTypeModelLike {
  active: boolean;
  tower: string;
}

export class NegotiationTypeDetailsModel
  extends NegotiationTypeModel
  implements NegotiationTypeDetailsModelLike
{
  active: boolean;
  tower: string;

  constructor(item?: Partial<NegotiationTypeDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
    this.tower = item?.tower;
  }
}
