import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  UserFilterLike,
  UserFilterOptionsDTO,
  UserFilterOptionsDTOLike,
} from '../models/dtos/user-filter.dto';
import { Observable, asyncScheduler, defer, map, of, subscribeOn } from 'rxjs';
import {
  UserModel,
  UserProfile,
  UserProfileModelLike,
  UserSimpleModelLike,
  UserStatus,
  UserStatusModelLike,
} from '../models/user.model';
import { PageResults } from '../models/page-regults.model';
import orderBy from 'lodash/orderBy';
import { OptionModelLike } from '../models/option.model';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import {
  UserDetailsModel,
  UserDetailsModelLike,
} from '../models/user-details.model';
import { UserSkillsDTOLike } from '../models/dtos/user-skills.dto';
import { ProtocolFilterLike } from '../models/dtos/protocol-filter.dto';
import { UserDelegateDTOLike } from '../models/dtos/user-delegate.dto';

@Injectable()
export class UsersService {
  private cacheService: ICacheService;

  constructor(private http: HttpClient, cacheFactory: CacheFactoryService) {
    this.cacheService = cacheFactory.getOrCreate('users');
  }

  getAllFakeUsersFromVivo(): Observable<any[]> {
    return this.http.get<any[]>(`~api/users/fakeFromVivo`);
  }

  listSimpleUsers(): Observable<UserSimpleModelLike[]> {
    return this.cacheService.getCached({
      path: 'users/simple',
      source: () => {
        return this.http.get<UserSimpleModelLike[]>(`~api/users/simple`);
      },
    });
  }

  listSupervisors() {
    return this.listSimpleUsers().pipe(
      map((res) => {
        return res.filter((x) => x.profileId === UserProfile.Supervisor);
      })
    );
  }

  getDetailsById(userId: number) {
    return this.http
      .get<UserDetailsModelLike>(`~api/users/${userId}/details`)
      .pipe(
        map((res) => {
          return new UserDetailsModel(res);
        })
      );
  }

  listPaged(
    options?: UserFilterOptionsDTOLike
  ): Observable<PageResults<UserModel>> {
    const params = new UserFilterOptionsDTO(options).toBodyParams();

    return this.http
      .post<PageResults<UserModel>>(`~api/users/query`, params)
      .pipe(
        map((res) => {
          res.results = res.results?.map((x) => {
            return new UserModel(x);
          });
          return res;
        })
      );
  }

  listProfile(): Observable<UserProfileModelLike[]> {
    return this.cacheService.getCached({
      path: 'profiles',
      source: () => {
        return this.http.get<UserProfileModelLike[]>(`~api/users/profiles`);
      },
    });
  }

  listStatus(): Observable<UserStatusModelLike[]> {
    return this.cacheService.getCached({
      path: 'statuses',
      source: () => {
        return this.http.get<UserStatusModelLike[]>(`~api/users/statuses`);
      },
    });
  }

  listStatusForAction() {
    return this.listStatus().pipe(
      map((list) => {
        const auxList = [UserStatus.Active, UserStatus.Inactive];
        return list.filter((x) => auxList.includes(x.id));
      })
    );
  }

  updateStatus(
    status: UserStatus,
    returnedAt?: Date,
    filters?: UserFilterLike
  ) {
    const body = {
      ...filters,
      returnDate: !returnedAt ? undefined : returnedAt,
      status,
    };

    return this.http.post<boolean>(`~api/users/changeStatus`, body);
  }

  updateSkills(skills: UserSkillsDTOLike, filters?: UserFilterLike) {
    const body: any = { ...skills };

    if (filters) {
      body.userFilters = filters;
    }

    return this.http.post<boolean>(`~api/users/setSkills`, body);
  }

  importSkills(file: File, filters?: UserFilterLike) {
    const formData = new FormData();
    formData.append('file', file, file.name);

    if (filters) {
      const keys = Object.keys(filters);
      for (let key of keys) {
        let value = filters[key];

        if (!Array.isArray(value)) {
          value = [value];
        }

        for (let x of value) {
          if (x === undefined || x === null) {
            continue;
          }

          formData.append(`userFilters.${key}`, JSON.stringify(x));
        }
      }
    }

    return this.http.post<boolean>(`~api/users/importSkills`, formData);
  }

  delegate(dto: UserDelegateDTOLike, filters?: UserFilterLike) {
    return this.http.post(`~api/users/delegate`, {
      ...dto,
      filters,
    });
  }

  export(filters?: UserFilterLike) {
    const body = { ...(filters ?? null) };
    return this.http.post(`~api/users/export`, body, {
      responseType: 'blob',
    });
  }

  downloadImportSkillsTemplate() {
    return this.http.get(`~api/users/downloadModel`, { responseType: 'blob' });
  }

  listUsersRelatedProtocols(
    filters: ProtocolFilterLike,
    subislandId?: number
  ): Observable<UserSimpleModelLike[]> {
    const body = { ...(filters ?? null) };

    let params = new HttpParams();
    if (subislandId) {
      params = params.set('subislandId', subislandId);
    }

    return this.http.post<UserSimpleModelLike[]>(
      `~api/protocols/listUsersRelatedProtocols`,
      body,
      {
        params,
      }
    );
  }
}
