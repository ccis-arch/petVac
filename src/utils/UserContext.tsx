import { createContext } from "react";

export const UserContext = createContext({
  userName: "",
  userId: "",
  userLocation: "",
  setUserName: (name: string) => {},
  setUserId: (id: string) => {},
  setLocation: (location: string) => {},
});
