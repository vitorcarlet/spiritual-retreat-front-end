import { UserObject } from "next-auth";

export type UserObjectWithId = UserObject & {
  id: string;
};
