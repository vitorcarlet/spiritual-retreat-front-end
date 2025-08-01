declare global {
  type TestAdmin = {
    id: number;
    name: string;
    email: string;
    role: "Admin" | "Manager" | "User";
    status: "active" | "inactive";
    createdAt: Date;
    age: number;
  };
}
