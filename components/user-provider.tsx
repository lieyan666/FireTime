"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import useSWR from "swr";
import type { User, UserId } from "@/lib/types";

interface UserContextType {
  currentUserId: UserId;
  setCurrentUserId: (id: UserId) => void;
  users: User[];
  currentUser: User | undefined;
  otherUser: User | undefined;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<UserId>("user1");
  const { data, isLoading } = useSWR<{ users: User[] }>("/api/users", fetcher);

  const users = data?.users || [];
  const currentUser = users.find((u) => u.id === currentUserId);
  const otherUser = users.find((u) => u.id !== currentUserId);

  // Load saved user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("currentUserId");
    if (saved === "user1" || saved === "user2") {
      setCurrentUserId(saved);
    }
  }, []);

  // Save user to localStorage
  const handleSetUserId = (id: UserId) => {
    setCurrentUserId(id);
    localStorage.setItem("currentUserId", id);
  };

  return (
    <UserContext.Provider
      value={{
        currentUserId,
        setCurrentUserId: handleSetUserId,
        users,
        currentUser,
        otherUser,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
