// import type { User, UserObject } from "next-auth";

import "next-auth";

/**
 * The returned data from the authorize method
 * This is data we extract from our own backend JWT tokens.
 */

declare module "next-auth" {
  export interface BackendAccessJWT {
    access_token?: string;
    expires_in?: number;
    id_token?: string;
    "not-before-policy"?: number;
    refresh_expires_in?: number;
    refresh_token?: string;
    scope?: string;
    session_state?: string;
    token_type?: string;
  }

  export type BackendJWT = BackendAccessJWT & {
    refresh_token: string;
  };

  /**
   * What user information we expect to be able to extract
   * from our backend response
   */
  export interface UserObject {
    id: number | string;
    email: string;
    name: string;
    first_name: string;
    last_name: string;
    roles: UserRoles;
    permissions: UserPermissions;
  }

  interface UserRoles {
    admin: boolean;
    manager: boolean;
    consultant: boolean;
    participant: boolean;
  }

  export type ResourceType =
    | "users"
    | "retreats"
    | "settings"
    | "bookings"
    | "profile"
    | "dashboard";

  export type ActionType = "create" | "read" | "update" | "delete";

  type UserPermissions = Record<ResourceType, Record<ActionType, boolean>>;

  export interface DecodedJWT {
    exp: number;
    iat: number;
    jti: string;
    iss: string;
    aud: string;
    sub: string;
    typ: string;
    azp: string;
    sid: string;
    acr: string;
    "allowed-origins": string[];
    roles: string[];
    permissions: Record<ResourceType, Record<ActionType, boolean>>;
    scope: string;
    email_verified: boolean;
    name: string;
    preferred_username: string;
    given_name: string;
    family_name: string;
    email: string;
  }

  /**
   * The initial backend authentication response contains both an `access` token and a `refresh` token.\
   * The refresh token is a long-lived token that is used to obtain a new access token\
   * when the current access token expires
   */
  export interface RefreshToken extends BackendAccessJWT {
    refresh_token: string;
  }

  /**
   * The decoded contents of a JWT token returned from the backend (both access and refresh tokens).\
   * It contains both the user information and other token metadata.\
   * `iat` is the time the token was issued, `exp` is the time the token expires, `jti` is the token id.
   */
  export interface DecodedJWT extends UserObject {
    token_type: "refresh" | "access";
    exp: number;
    iat: number;
    jti: string;
  }

  /**
   * Information extracted from our decoded backend tokens so that we don't need to decode them again.\
   * `valid_until` is the time the access token becomes invalid\
   * `refresh_until` is the time the refresh token becomes invalid
   */
  export interface AuthValidity {
    valid_until: number;
    refresh_until: number;
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    //id: string; // The user ID, usually the `jti` of the refresh token
    tokens: BackendJWT;
    user: UserObject;
    validity: AuthValidity;
  }
  /**
   * The shape of the account object returned in the OAuth providers' `account` callback,
   * Usually contains information about the provider being used, like OAuth tokens (`access_token`, etc).
   */
  // interface Account {}

  /**
   * Returned by `useSession`, `auth`, contains information about the active session.
   */
  export interface Session {
    user: UserObject;
    validity: AuthValidity;
    error: "RefreshTokenExpired" | "RefreshAccessTokenError";
    tokens: BackendJWT;
  }
}

// The `JWT` interface can be found in the `next-auth/jwt` submodule
//import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  /**
   * The contents of our refresh call to the backend is a new access token
   */

  export interface BackendAccessJWT {
    access_token?: string;
    expires_in?: number;
    id_token?: string;
    "not-before-policy"?: number;
    refresh_expires_in?: number;
    refresh_token?: string;
    scope?: string;
    session_state?: string;
    token_type?: string;
  }
  /**
   * The initial backend authentication response contains both an `access` token and a `refresh` token.\
   * The refresh token is a long-lived token that is used to obtain a new access token\
   * when the current access token expires
   */
  export interface BackendJWT extends BackendAccessJWT {
    refresh_token: string;
  }

  export interface UserObject {
    sub: string;
    email: string;
    name: string;
    first_name: string;
    last_name: string;
    roles: string[];
    permissions: {
      [key: string]: string[];
    };
  }

  /**
   * Information extracted from our decoded backend tokens so that we don't need to decode them again.\
   * `valid_until` is the time the access token becomes invalid\
   * `refresh_until` is the time the refresh token becomes invalid
   */
  export interface AuthValidity {
    valid_until: number;
    refresh_until: number;
  }

  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `getToken`, when using JWT sessions
   */
  export interface JWT {
    data: User | null;
    error: "RefreshTokenExpired" | "RefreshAccessTokenError" | "NoTokenData";
  }
}
