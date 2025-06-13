import {
  TimeInterval,
  TimeIntervalLike,
} from '../helpers/time-span/time-interval';
import { CustomerModel, CustomerModelLike } from './customer.model';
import { IslandModel, IslandModelLike } from './island.model';
import { ProductModel, ProductModelLike } from './product.model';
import { SegmentModel, SegmentModelLike } from './segment.model';
import { SubislandModel, SubislandModelLike } from './subisland.model';
import { SubjectModel, SubjectModelLike } from './subject.model';
import { TowerModel, TowerModelLike } from './tower.model';
import {
  NegotiationTypeModel,
  NegotiationTypeModelLike,
} from './negotiation-type.model';
import { UserModel, UserModelLike } from './user.model';

export interface UserDetailsModelLike extends UserModelLike {
  priority: boolean;
  towerId: number;
  tower: string;
  islandId: number;
  island: string;
  subislandId: number;
  subisland: string;
  subjectId: number;
  subject: string;
  segment: string;
  towers: TowerModelLike[];
  islands: IslandModelLike[];
  subislands: SubislandModelLike[];
  subjects: SubjectModelLike[];
  negotiationTypes: NegotiationTypeModelLike[];
  products: ProductModelLike[];
  segments: SegmentModelLike[];
  customers: CustomerModelLike[];
}

export class UserDetailsModel
  extends UserModel
  implements UserDetailsModelLike
{
  priority: boolean;
  towerId: number;
  tower: string;
  islandId: number;
  island: string;
  subislandId: number;
  subisland: string;
  subjectId: number;
  subject: string;
  segment: string;
  towers: TowerModel[];
  islands: IslandModel[];
  subislands: SubislandModel[];
  subjects: SubjectModel[];
  negotiationTypes: NegotiationTypeModel[];
  products: ProductModel[];
  segments: SegmentModel[];
  customers: CustomerModel[];

  constructor(item?: Partial<UserDetailsModelLike>) {
    super(item);
    this.priority = !!item?.priority;
    this.towerId = item?.towerId;
    this.tower = item?.tower;
    this.islandId = item?.islandId;
    this.island = item?.island;
    this.subislandId = item?.subislandId;
    this.subisland = item?.subisland;
    this.subjectId = item?.subjectId;
    this.subject = item?.subject;
    this.segment = item?.segment;
    this.towers = item?.towers?.map((x) => new TowerModel(x));
    this.islands = item?.islands?.map((x) => new IslandModel(x));
    this.subislands = item?.subislands?.map((x) => new SubislandModel(x));
    this.subjects = item?.subjects?.map((x) => new SubjectModel(x));
    this.negotiationTypes = item?.negotiationTypes?.map(
      (x) => new NegotiationTypeModel(x)
    );
    this.products = item?.products?.map((x) => new ProductModel(x));
    this.segments = item?.segments?.map((x) => new SegmentModel(x));
    this.customers = item?.customers?.map((x) => new CustomerModel(x));
  }
}
