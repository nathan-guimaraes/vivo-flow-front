import { ISetParamsAdapter } from '../../helpers/query-options/base-options';
import {
  SortOptions,
  SortOptionsLike,
} from '../../helpers/query-options/sort-options';
import { UserProfile, UserStatus } from '../user.model';

export interface UserFilterLike {
  userIds?: number[];
  logins?: string[];
  names?: string[];
  supervisors?: number[];
  profiles?: UserProfile[];
  towers?: number[];
  islands?: number[];
  subislands?: number[];
  subjects?: number[];
  segments?: number[];
  suppliers?: number[];
  statuses?: UserStatus[];
}

export interface UserFilterOptionsDTOLike
  extends SortOptionsLike,
    UserFilterLike {}

export class UserFilterOptionsDTO
  extends SortOptions<UserFilterOptionsDTO, UserFilterOptionsDTOLike>
  implements UserFilterOptionsDTOLike
{
  userIds?: number[];
  logins?: string[];
  names?: string[];
  supervisors?: number[];
  profiles?: UserProfile[];
  towers?: number[];
  islands?: number[];
  subislands?: number[];
  subjects?: number[];
  segments?: number[];
  suppliers?: number[];
  statuses?: UserStatus[];

  override reset(options?: Partial<UserFilterOptionsDTOLike>): void {
    super.reset(options);
    this.userIds = options?.userIds;
    this.logins = options?.logins;
    this.names = options?.names;
    this.supervisors = options?.supervisors;
    this.profiles = options?.profiles;
    this.towers = options?.towers;
    this.islands = options?.islands;
    this.subislands = options?.subislands;
    this.subjects = options?.subjects;
    this.segments = options?.segments;
    this.suppliers = options?.suppliers;
    this.statuses = options?.statuses;
  }

  override _handleParamsAdapter(paramsAdapter: ISetParamsAdapter) {
    super._handleParamsAdapter(paramsAdapter);

    if (this.userIds?.length) {
      paramsAdapter.set('userIds', this.userIds);
    }

    if (this.logins?.length) {
      paramsAdapter.set('logins', this.logins);
    }

    if (this.names?.length) {
      paramsAdapter.set('names', this.names);
    }

    if (this.supervisors?.length) {
      paramsAdapter.set('supervisors', this.supervisors);
    }

    if (this.profiles?.length) {
      paramsAdapter.set('profiles', this.profiles);
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

    if (this.suppliers?.length) {
      paramsAdapter.set('suppliers', this.suppliers);
    }

    if (this.statuses?.length) {
      paramsAdapter.set('statuses', this.statuses);
    }
  }
}
