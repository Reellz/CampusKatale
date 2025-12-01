import { useUser } from "@clerk/clerk-react";

export const useAdmin = () => {
  const { user } = useUser();
  return user?.publicMetadata?.role === "admin";
};