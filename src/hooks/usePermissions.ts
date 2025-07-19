import { useSession } from "next-auth/react";
import { ResourceType, UserRoles } from "next-auth";

export function usePermissions() {
  const { data: session } = useSession();

  const canCreate = (resource: ResourceType) => {
    return session?.user?.permissions?.[resource].create ?? false;
  };

  const canRead = (resource: ResourceType) => {
    return session?.user?.permissions?.[resource].read ?? false;
  };

  const canUpdate = (resource: ResourceType) => {
    return session?.user?.permissions?.[resource].update ?? false;
  };

  const canDelete = (resource: ResourceType) => {
    return session?.user?.permissions?.[resource].delete ?? false;
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
