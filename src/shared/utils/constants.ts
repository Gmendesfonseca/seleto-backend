export const PERMISSION_KEY = 'permission';
export const SECURED_KEY = 'secured';

export const UserType = {
  COMPANY: 'COMPANY',
  PERSON: 'PERSON',
} as const;
export type UserType = (typeof UserType)[keyof typeof UserType];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
};
