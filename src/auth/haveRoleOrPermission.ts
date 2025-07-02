import { auth } from "@/auth";

const roleMap = {
  admin: {
    "1.1": true,
    "2.1": true,
    "3.1": true,
    "4.1": true,
    "5.1": true,
    "6.1": true,
    "7.1": true,
    "8.1": true,
    "9.1": true,
    "10.1": true,
  },
  manager: {
    "1.1": false,
    "2.1": false,
    "3.1": true,
    "4.1": true,
    "5.1": true,
    "6.1": true,
    "7.1": true,
    "8.1": true,
    "9.1": true,
    "10.1": true,
  },
  consultant: {
    "1.1": false,
    "2.1": false,
    "3.1": false,
    "4.1": false,
    "5.1": false,
    "6.1": true,
    "7.1": true,
    "8.1": true,
    "9.1": true,
    "10.1": true,
  },
};

const haveRoleOrPermission = (permission: string) => {
  const session = auth();
  const { permissions, role } = session?.user || {};
  if (roleMap[role][permission] == true || permissions?.includes(permission))
    return true;
  return false;
};

export default haveRoleOrPermission;
