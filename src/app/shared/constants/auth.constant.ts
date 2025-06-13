import { InjectionToken } from '@angular/core';
import { IRxStorage } from '@rxjs-storage/core/dist/types/internal/interfaces';
import { UserProfile } from '../models/user.model';

export const AUTH_STORAGE = new InjectionToken<IRxStorage>('AUTH_STORAGE');

export const Roles = {
  SystemAdmin: {
    UploadBase: 'SystemAdmin.UploadBase',
    Fields: 'SystemAdmin.Fields',
    Parameters: 'SystemAdmin.Parameters',
    Flows: 'SystemAdmin.Flows',
    SLA: 'SystemAdmin.SLA',
    Productivity: 'SystemAdmin.Productivity',
    CutoffDate: 'SystemAdmin.CutoffDate',
    Report: 'SystemAdmin.Report',
  },
  UserAdmin: {
    Status: 'UserAdmin.Status',
    Skills: 'UserAdmin.Skills',
    Report: 'UserAdmin.Report',
    Delegate: 'UserAdmin.Delegate',
  },
  ProtocolsAdmin: {
    Read: 'ProtocolsAdmin.Read',
    Distribution: 'ProtocolsAdmin.Distribution',
  },
  DealingProtocols: {
    Write: 'DealingProtocols.Write',
  },
  Indicators: 'Indicators',
};

export const rolesMap = new Map<UserProfile, string[]>([
  [
    UserProfile.Admin,
    [
      Roles.SystemAdmin.UploadBase,
      Roles.SystemAdmin.Fields,
      Roles.SystemAdmin.Parameters,
      Roles.SystemAdmin.Flows,
      Roles.SystemAdmin.SLA,
      Roles.SystemAdmin.Productivity,
      Roles.SystemAdmin.CutoffDate,
      Roles.SystemAdmin.Report,
      Roles.UserAdmin.Status,
      Roles.UserAdmin.Skills,
      Roles.UserAdmin.Report,
      Roles.UserAdmin.Delegate,
      Roles.ProtocolsAdmin.Read,
      Roles.ProtocolsAdmin.Distribution,
      Roles.Indicators,
    ],
  ],
  [
    UserProfile.Manager,
    [
      Roles.SystemAdmin.UploadBase,
      Roles.SystemAdmin.CutoffDate,
      Roles.SystemAdmin.Report,
      Roles.UserAdmin.Status,
      Roles.UserAdmin.Skills,
      Roles.UserAdmin.Report,
      Roles.UserAdmin.Delegate,
      Roles.ProtocolsAdmin.Read,
      Roles.ProtocolsAdmin.Distribution,
      Roles.Indicators,
    ],
  ],
  [
    UserProfile.TeamVivo,
    [
      Roles.SystemAdmin.UploadBase,
      Roles.SystemAdmin.CutoffDate,
      Roles.SystemAdmin.Report,
      Roles.UserAdmin.Status,
      Roles.UserAdmin.Skills,
      Roles.UserAdmin.Report,
      Roles.UserAdmin.Delegate,
      Roles.ProtocolsAdmin.Read,
      Roles.ProtocolsAdmin.Distribution,
      Roles.Indicators,
    ],
  ],
  [UserProfile.Consultant, [Roles.ProtocolsAdmin.Read, Roles.Indicators]],
  [
    UserProfile.Supervisor,
    [
      Roles.SystemAdmin.UploadBase,
      Roles.UserAdmin.Status,
      Roles.UserAdmin.Skills,
      Roles.UserAdmin.Report,
      Roles.UserAdmin.Delegate,
      Roles.ProtocolsAdmin.Read,
      Roles.ProtocolsAdmin.Distribution,
      Roles.Indicators,
    ],
  ],
  [
    UserProfile.Operator,
    [Roles.ProtocolsAdmin.Read, Roles.DealingProtocols.Write],
  ],
]);
