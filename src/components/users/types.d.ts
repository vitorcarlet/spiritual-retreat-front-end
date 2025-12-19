import { UserObject } from 'next-auth';

interface User extends UserObject {
  id: number;
  name: string;
  email: string;
  role: string;
  enabled: boolean;
  emailConfirmed: boolean;
}
