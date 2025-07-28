// Definir tipos para as permissões
interface Permission {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface PermissionSection {
  id: string;
  label: string;
  icon: string;
  permissions: Permission[];
}

interface UserPermissionsData {
  role: UserRoles;
  permissions: UserPermissions;
}
