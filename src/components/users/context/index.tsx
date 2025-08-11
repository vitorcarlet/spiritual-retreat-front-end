import React, { createContext, useContext, useState, ReactNode } from "react";
import { UserObject as User } from "next-auth";
type UserContentContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const UserContentContext = createContext<UserContentContextType | null>(null);

type UserContentProviderProps = {
  user: User | null;
  children: ReactNode;
};

export const UserContentProvider = ({
  user: userResponse,
  children,
}: UserContentProviderProps) => {
  const [user, setUser] = useState<User | null>(userResponse);

  return (
    <UserContentContext.Provider value={{ user, setUser }}>
      {children}
    </UserContentContext.Provider>
  );
};

export const useUserContent = () => {
  const context = useContext(UserContentContext);
  if (!context) {
    throw new Error("useUserContent must be used within a UserContentProvider");
  }
  return context;
};
