import { ProtocolPriority } from './protocol.model';
import { IndicatorSLA } from './sla.model';

export interface ProtocolLogModelLike {
  id: number;
  priority: ProtocolPriority;
  priorityWeight: number;
  number: string;
  indicatorSla: IndicatorSLA;
  customer: string;
  document: string;
  tower: string;
  island: string;
  subisland: string;
  subject: string;
  segment: string;
  product: string;
  negotiationType: string;
  supplier: string;
  user: string;
  codeGroup: number;
  customerCode: number;
  partnerCode: string;
}

export class ProtocolModel implements ProtocolLogModelLike {
  id: number;
  priority: ProtocolPriority;
  priorityWeight: number;
  number: string;
  indicatorSla: IndicatorSLA;
  customer: string;
  document: string;
  tower: string;
  island: string;
  subisland: string;
  subject: string;
  segment: string;
  product: string;
  negotiationType: string;
  supplier: string;
  user: string;
  codeGroup: number;
  customerCode: number;
  partnerCode: string;

  constructor(item?: Partial<ProtocolLogModelLike>) {
    this.id = item?.id;
    this.priority = item?.priority;
    this.priorityWeight = item?.priorityWeight;
    this.number = item?.number;
    this.indicatorSla = item?.indicatorSla;
    this.customer = item?.customer;
    this.document = item?.document;
    this.tower = item?.tower;
    this.island = item?.island;
    this.subisland = item?.subisland;
    this.subject = item?.subject;
    this.segment = item?.segment;
    this.product = item?.product;
    this.negotiationType = item?.negotiationType;
    this.supplier = item?.supplier;
    this.user = item?.user;
    this.codeGroup = item?.codeGroup;
    this.customerCode = item?.customerCode;
    this.partnerCode = item?.partnerCode;
  }
}
