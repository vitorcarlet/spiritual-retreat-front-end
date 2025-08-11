interface User extends UserObject {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt: Date;
  age: number;
}
