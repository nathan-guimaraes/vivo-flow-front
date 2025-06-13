import { ISetParamsAdapter } from '../../helpers/query-options/base-options';
import {
  SortOptions,
  SortOptionsLike,
} from '../../helpers/query-options/sort-options';
import { ProtocolPriority } from '../protocol.model';



export interface ProtocolFilterLike {
  protocolIds?: number[];
  number?: string;
  status?: number;
  documents?: string[];
  customerCodes?: string[];
  codeGroups?: string[];
  partnerCodes?: string[];
  towers?: number[];
  islands?: number[];
  subislands?: number[];
  subjects?: number[];
  segments?: number[];
  products?: number[];
  negotiationTypes?: number[];
  suppliers?: number[];
  userIds?: number[];
  priorities?: ProtocolPriority[];
  slas?: number[];
}

export interface ProtocolFilterOptionsDTOLike
  extends SortOptionsLike,
    ProtocolFilterLike {}

export class ProtocolFilterOptionsDTO
  extends SortOptions<ProtocolFilterOptionsDTO, ProtocolFilterOptionsDTOLike>
  implements ProtocolFilterOptionsDTOLike
{
  protocolIds?: number[];
  number?: string;
  status?: number;
  towers?: number[];
  islands?: number[];
  subislands?: number[];
  subjects?: number[];
  segments?: number[];
  partnerCodes?: string[];
  documents?: string[];
  codeGroups?: string[];
  customerCodes?: string[];
  negotiationTypes?: number[];
  products?: number[];
  userIds?: number[];
  suppliers?: number[];
  priorities?: ProtocolPriority[];
  slas?: number[];

  override reset(options?: Partial<ProtocolFilterOptionsDTOLike>): void {
    super.reset(options);
    this.protocolIds = options?.protocolIds;
    this.number = options?.number;
    this.status = options?.status;
    this.towers = options?.towers;
    this.islands = options?.islands;
    this.subislands = options?.subislands;
    this.subjects = options?.subjects;
    this.segments = options?.segments;
    this.partnerCodes = options?.partnerCodes;
    this.documents = options?.documents;
    this.codeGroups = options?.codeGroups;
    this.customerCodes = options?.customerCodes;
    this.negotiationTypes = options?.negotiationTypes;
    this.products = options?.products;
    this.userIds = options?.userIds;
    this.suppliers = options?.suppliers;
    this.priorities = options?.priorities;
    this.slas = options?.slas;
  }

  override _handleParamsAdapter(paramsAdapter: ISetParamsAdapter) {
    super._handleParamsAdapter(paramsAdapter);

    if (this.protocolIds?.length) {
      paramsAdapter.set('protocolIds', this.protocolIds);
    }

    if (this.number) {
      paramsAdapter.set('number', this.number);
    }

    if (this.status) {
      paramsAdapter.set('status', this.status);
    }

    if (this.towers?.length) {
      paramsAdapter.set('towers', this.towers);
    }

    if (this.islands?.length) {
      paramsAdapter.set('islands', this.islands);
    }

    if (this.subislands?.length) {
      paramsAdapter.set('subislands', this.subislands);
    }

    if (this.subjects?.length) {
      paramsAdapter.set('subjects', this.subjects);
    }

    if (this.segments?.length) {
      paramsAdapter.set('segments', this.segments);
    }

    if (this.partnerCodes?.length) {
      paramsAdapter.set('partnerCodes', this.partnerCodes);
    }

    if (this.documents?.length) {
      paramsAdapter.set('documents', this.documents);
    }

    if (this.codeGroups?.length) {
      paramsAdapter.set('codeGroups', this.codeGroups);
    }

    if (this.customerCodes?.length) {
      paramsAdapter.set('codeCustomers', this.customerCodes);
    }

    if (this.negotiationTypes?.length) {
      paramsAdapter.set('negotiationTypes', this.negotiationTypes);
    }

    if (this.products?.length) {
      paramsAdapter.set('products', this.products);
    }

    if (this.userIds?.length) {
      paramsAdapter.set('userIds', this.userIds);
    }

    if (this.suppliers?.length) {
      paramsAdapter.set('suppliers', this.suppliers);
    }

    if (this.priorities?.length) {
      paramsAdapter.set('priorities', this.priorities);
    }

    if (this.slas?.length) {
      paramsAdapter.set('slas', this.slas);
    }
  }
}
