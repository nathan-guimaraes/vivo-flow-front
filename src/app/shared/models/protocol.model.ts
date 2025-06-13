import { TimeSpan } from '../helpers/time-span/time-span';
import { IndicatorSLA } from './sla.model';

export enum ProtocolPriority {
  None = 0,
  Current = 1, // esteira atual
  All = 2, // toda a esteira
}

export interface ProtocolModelLike {
  id: number;
  priority: ProtocolPriority;
  priorityWeight: number;
  number: string;
  status: string;
  transferError?: string;
  customer: string;
  document: string;
  towerId: number;
  tower: string;
  islandId: number;
  island: string;
  subislandId: number;
  subisland: string;
  subjectId: number;
  subject: string;
  segmentId: number;
  segment: string;
  product: string;
  negotiationTypeId: number;
  negotiationType: string;
  supplier: string;
  user: string;
  codeGroup: number;
  customerCode: number;
  partnerCode: string;
  legacyId?: number;
}

export class ProtocolModel implements ProtocolModelLike {
  id: number;
  priority: ProtocolPriority;
  priorityWeight: number;
  number: string;
  status: string;
  transferError?: string;
  customer: string;
  document: string;
  towerId: number;
  tower: string;
  islandId: number;
  island: string;
  subislandId: number;
  subisland: string;
  subjectId: number;
  subject: string;
  segmentId: number;
  segment: string;
  product: string;
  negotiationTypeId: number;
  negotiationType: string;
  supplier: string;
  user: string;
  codeGroup: number;
  customerCode: number;
  partnerCode: string;
  legacyId?: number;

  constructor(item?: Partial<ProtocolModelLike>) {
    this.id = item?.id;
    this.priority = item?.priority;
    this.priorityWeight = item?.priorityWeight;
    this.number = item?.number;
    this.status = item?.status;
    this.transferError = item?.transferError;
    this.customer = item?.customer;
    this.document = item?.document;
    this.towerId = item?.towerId;
    this.tower = item?.tower;
    this.islandId = item?.islandId;
    this.island = item?.island;
    this.subislandId = item?.subislandId;
    this.subisland = item?.subisland;
    this.subjectId = item?.subjectId;
    this.subject = item?.subject;
    this.segmentId = item?.segmentId;
    this.segment = item?.segment;
    this.product = item?.product;
    this.negotiationTypeId = item?.negotiationTypeId;
    this.negotiationType = item?.negotiationType;
    this.supplier = item?.supplier;
    this.user = item?.user;
    this.codeGroup = item?.codeGroup;
    this.customerCode = item?.customerCode;
    this.partnerCode = item?.partnerCode;
    this.legacyId = item?.legacyId;
  }
}

export interface ProtocolWithTimersModelLike extends ProtocolModelLike {
  indicatorSla: IndicatorSLA;
  treatmentTimeSpend?: TimeSpan;
  queueTimeSpend?: TimeSpan;
}

export class ProtocolWithTimersModel
  extends ProtocolModel
  implements ProtocolWithTimersModelLike
{
  indicatorSla: IndicatorSLA;
  treatmentTimeSpend?: TimeSpan;
  queueTimeSpend?: TimeSpan;

  constructor(item?: Partial<ProtocolWithTimersModelLike>) {
    super(item);
    this.indicatorSla = item?.indicatorSla;
    this.treatmentTimeSpend = TimeSpan.parse(item?.treatmentTimeSpend);
    this.queueTimeSpend = TimeSpan.parse(item?.queueTimeSpend);
  }
}

export interface ProtocolWithDetailsModelLike extends ProtocolModelLike {
  details?: ProtocolDetailsModelLike;
}

export class ProtocolWithDetailsModel
  extends ProtocolModel
  implements ProtocolWithDetailsModelLike
{
  details?: ProtocolDetailsModel;

  constructor(item?: Partial<ProtocolWithDetailsModelLike>) {
    super(item);
    this.details = !item?.details
      ? null
      : new ProtocolDetailsModel(item.details);
  }
}

export interface ProtocolDetailsModelLike {
  protocolId: number;

  // #region Manual Fields
  analyst?: string;
  activityId?: number;
  quotation?: string;
  amendmentContractDate?: Date;
  returnDate?: Date;
  smpDate?: Date;
  forwardedRenegotiation?: boolean;
  exception?: string;
  exceptionReason?: string;
  salesOrder?: string;
  offender?: string;
  order?: string;
  complementaryOrders?: string;
  portabilityTransfer?: boolean;
  deviceQty?: number;
  qty?: number;
  linesQty?: number;
  licensesQty?: number;
  complaint?: string;
  revision?: number;
  sfa?: string;
  requestDepApple?: boolean;
  requestDifferentAddressDelivery?: boolean;
  requester?: string;
  atlasQty?: number;
  backupQty?: number;
  fixedQty?: number;
  m2mQty?: number;
  terminalsQty?: number;
  penQty?: number;
  migrationQty?: number;
  portabilityQty?: number;
  prePostQty?: number;
  exchangesQty?: number;
  ttQty?: number;
  nSimplify?: string;
  contractType?: string;
  failureType?: string;
  documentType?: string;
  totalVolume?: number;
  amountInvolved?: number;
  vmn?: number;
  // #endregion

  // #region Automatic Fields
  microStep?: string;
  stepDate?: Date;
  lastUpdateDate?: Date;
  nSfa?: string;
  nSimulation?: string;
  nComposition?: string;
  nQuotation?: string;
  nPrincipalQuotation?: string;
  nOrder?: string;
  nInfoB2b?: string;
  flow?: string;
  service?: string;
  row?: string;
  infoB2bReason?: string;
  statusRequest?: string;
  substatusRequest?: string;
  statusRequestDate?: Date;
  activityType?: string;
  activityStatus?: string;
  activityName?: string;
  activityComment?: string;
  productDescription?: string;
  productType?: string;
  productQty?: number;
  erroLinesQty?: number;
  swapQty?: number;
  // #endregion
}

export class ProtocolDetailsModel implements ProtocolDetailsModelLike {
  protocolId: number;

  // #region Manual Fields
  analyst?: string;
  activityId?: number;
  quotation?: string;
  amendmentContractDate?: Date;
  returnDate?: Date;
  smpDate?: Date;
  forwardedRenegotiation?: boolean;
  exception?: string;
  exceptionReason?: string;
  salesOrder?: string;
  offender?: string;
  order?: string;
  complementaryOrders?: string;
  portabilityTransfer?: boolean;
  deviceQty?: number;
  qty?: number;
  linesQty?: number;
  licensesQty?: number;
  complaint?: string;
  revision?: number;
  sfa?: string;
  requestDepApple?: boolean;
  requestDifferentAddressDelivery?: boolean;
  requester?: string;
  atlasQty?: number;
  backupQty?: number;
  fixedQty?: number;
  m2mQty?: number;
  terminalsQty?: number;
  penQty?: number;
  migrationQty?: number;
  portabilityQty?: number;
  prePostQty?: number;
  exchangesQty?: number;
  ttQty?: number;
  nSimplify?: string;
  contractType?: string;
  failureType?: string;
  documentType?: string;
  totalVolume?: number;
  amountInvolved?: number;
  vmn?: number;
  // #endregion

  // #region Automatic Fields
  microStep?: string;
  stepDate?: Date;
  lastUpdateDate?: Date;
  nSfa?: string;
  nSimulation?: string;
  nComposition?: string;
  nQuotation?: string;
  nPrincipalQuotation?: string;
  nOrder?: string;
  nInfoB2b?: string;
  flow?: string;
  service?: string;
  row?: string;
  infoB2bReason?: string;
  statusRequest?: string;
  substatusRequest?: string;
  statusRequestDate?: Date;
  activityType?: string;
  activityStatus?: string;
  activityName?: string;
  activityComment?: string;
  productDescription?: string;
  productType?: string;
  productQty?: number;
  erroLinesQty?: number;
  swapQty?: number;
  // #endregion

  constructor(item?: Partial<ProtocolDetailsModelLike>) {
    this.protocolId = item?.protocolId;

    // #region Manual Fields
    this.analyst = item?.analyst;
    this.activityId = item?.activityId;
    this.quotation = item?.quotation;
    this.amendmentContractDate = toDate(item?.amendmentContractDate);
    this.returnDate = toDate(item?.returnDate);
    this.smpDate = toDate(item?.smpDate);
    this.forwardedRenegotiation = item?.forwardedRenegotiation;
    this.exception = item?.exception;
    this.exceptionReason = item?.exceptionReason;
    this.salesOrder = item?.salesOrder;
    this.offender = item?.offender;
    this.order = item?.order;
    this.complementaryOrders = item?.complementaryOrders;
    this.portabilityTransfer = item?.portabilityTransfer;
    this.deviceQty = item?.deviceQty;
    this.qty = item?.qty;
    this.linesQty = item?.linesQty;
    this.licensesQty = item?.licensesQty;
    this.complaint = item?.complaint;
    this.revision = item?.revision;
    this.sfa = item?.sfa;
    this.requestDepApple = item?.requestDepApple;
    this.requestDifferentAddressDelivery =
      item?.requestDifferentAddressDelivery;
    this.requester = item?.requester;
    this.atlasQty = item?.atlasQty;
    this.backupQty = item?.backupQty;
    this.fixedQty = item?.fixedQty;
    this.m2mQty = item?.m2mQty;
    this.terminalsQty = item?.terminalsQty;
    this.penQty = item?.penQty;
    this.migrationQty = item?.migrationQty;
    this.portabilityQty = item?.portabilityQty;
    this.prePostQty = item?.prePostQty;
    this.exchangesQty = item?.exchangesQty;
    this.ttQty = item?.ttQty;
    this.nSimplify = item?.nSimplify;
    this.contractType = item?.contractType;
    this.failureType = item?.failureType;
    this.documentType = item?.documentType;
    this.totalVolume = item?.totalVolume;
    this.amountInvolved = item?.amountInvolved;
    this.vmn = item?.vmn;
    // #endregion

    // #region Automatic Fields
    this.microStep = item?.microStep;
    this.stepDate = toDate(item?.stepDate);
    this.lastUpdateDate = toDate(item?.lastUpdateDate);
    this.nSfa = item?.nSfa;
    this.nSimulation = item?.nSimulation;
    this.nComposition = item?.nComposition;
    this.nQuotation = item?.nQuotation;
    this.nPrincipalQuotation = item?.nPrincipalQuotation;
    this.nOrder = item?.nOrder;
    this.nInfoB2b = item?.nInfoB2b;
    this.flow = item?.flow;
    this.service = item?.service;
    this.row = item?.row;
    this.infoB2bReason = item?.infoB2bReason;
    this.statusRequest = item?.statusRequest;
    this.substatusRequest = item?.substatusRequest;
    this.statusRequestDate = toDate(item?.statusRequestDate);
    this.activityType = item?.activityType;
    this.activityStatus = item?.activityStatus;
    this.activityName = item?.activityName;
    this.activityComment = item?.activityComment;
    this.productDescription = item?.productDescription;
    this.productType = item?.productType;
    this.productQty = item?.productQty;
    this.erroLinesQty = item?.erroLinesQty;
    this.swapQty = item?.swapQty;
    // #endregion
  }
}

function toDate(value: any) {
  return !value ? null : new Date(value);
}
