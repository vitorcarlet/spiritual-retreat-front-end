type Roles = "admin" | "manager" | "consultant" | "participant";

type User = {
  id: string;
  name: string;
  email: string;
  birth: string;
  role: Roles;
  permissions: UserPermissions;
  cpf: string;
  city: string;
  state: string;
  stateShort: string;
  profileImage?: string;
};
