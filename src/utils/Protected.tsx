"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useRouter } from "next/navigation";

import { UserContext } from "./UserContext";
import { LoadingScreenFullScreen } from "@/components/LoadingScreen";

type User = any;

const Protected = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [userLocation, setLocation] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error && error.status === 401) {
          router.push("/");
        } else if (error) {
          console.error("Error fetching user:", error.message);
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    if (user) {
      const checkRole = async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session?.access_token) return;

          const res = await fetch("/api/auth/role", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) return;

          const data = await res.json();

          if (data.role === "personnel") {
            setUserName(data.user.name);
            setUserId(user.id);
            router.push("/personnel/dashboard/registration");
            return;
          }

          if (data.role === "pet-owner") {
            setUserName(data.user.name);
            setUserId(user.id);
            setLocation(data.user.barangay || "");
            router.push("/pet-owner/dashboard");
            return;
          }

          if (data.role === "admin") {
            setUserName("Admin");
            setUserId(user.id);
            router.push("/admin/dashboard/dashboard");
            return;
          }
        } catch (error) {
          console.error("Error checking role:", error);
        }
      };

      checkRole();
    }
  }, [user, router]);

  if (isLoading) {
    return <LoadingScreenFullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        userName,
        userId,
        userLocation,
        setUserName,
        setUserId,
        setLocation,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default Protected;
