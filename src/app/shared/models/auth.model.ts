import { UserProfile } from "./user.model";

export interface AuthInfoLike {
  userId?: string;
  login?: string;
  userName?: string;
  profileId?: UserProfile;

  tokenType?: string;
  accessToken?: string;
  expires?: Date;
}

export class AuthInfoModel implements AuthInfoLike {
  userId?: string;
  login?: string;
  userName?: string;
  profileId?: UserProfile;

  tokenType?: string;
  accessToken?: string;
  expires?: Date;

  constructor(obj?: Partial<AuthInfoLike>) {
    this.userId = obj?.userId;
    this.userName = obj?.userName;
    this.login = obj?.login;
    this.profileId = obj?.profileId;

    this.tokenType = obj?.tokenType;
    this.accessToken = obj?.accessToken;
    this.expires = obj?.expires ? new Date(obj?.expires) : null;
  }

  isAuthenticated() {
    return !!(this.accessToken && (this.expires?.getTime() ?? 0) > Date.now());
  }
}
