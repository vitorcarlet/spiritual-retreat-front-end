import { useSession } from "next-auth/react";
import { UserPermissions, UserRoles } from "next-auth";

export function usePermissions() {
  const { data: session } = useSession();

  const canCreate = (resource: keyof UserPermissions["create"]) => {
    return session?.user?.permissions?.create?.[resource] ?? false;
  };

  const canRead = (resource: keyof UserPermissions["read"]) => {
    return session?.user?.permissions?.read?.[resource] ?? false;
  };

  const canUpdate = (resource: keyof UserPermissions["update"]) => {
    return session?.user?.permissions?.update?.[resource] ?? false;
  };

  const canDelete = (resource: keyof UserPermissions["delete"]) => {
    return session?.user?.permissions?.delete?.[resource] ?? false;
  };

  const hasRole = (role: keyof UserRoles) => {
    return session?.user?.roles?.[role] ?? false;
  };

  const canManageUsers = () => canCreate("users") && canUpdate("users");
  const isAdmin = () => hasRole("admin");
  const isManager = () => hasRole("manager");
  const canAccessAdminPanel = () => isAdmin() || isManager();

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    hasRole,
    canManageUsers,
    isAdmin,
    isManager,
    canAccessAdminPanel,
    user: session?.user,
  };
}
