export interface ProtocolFieldModelLike {
  id: number;
  name: string;
  label: string;
  isManual: boolean;
}

export class ProtocolFieldModel implements ProtocolFieldModelLike {
  id: number;
  name: string;
  label: string;
  isManual: boolean;

  constructor(item?: Partial<ProtocolFieldModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
    this.label = item?.label;
    this.isManual = !!item?.isManual;
  }
}

export interface ProtocolFieldDealingModelLike extends ProtocolFieldModelLike {
  active: boolean;
  required: boolean;
}

export class ProtocolFieldDealingModel
  extends ProtocolFieldModel
  implements ProtocolFieldModelLike
{
  active: boolean;
  required: boolean;

  constructor(item?: Partial<ProtocolFieldDealingModelLike>) {
    super(item);
    this.active = !!item?.active;
    this.required = !!item?.required;
  }
}
