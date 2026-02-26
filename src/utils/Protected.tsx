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
          const response = await fetch("/api/admin/check-role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          });

          const result = await response.json();

          if (result.role === "personnel") {
            setUserName(result.name);
            setUserId(user.id);
            router.push("/personnel/dashboard/registration");
            return;
          }

          if (result.role === "pet-owner") {
            setUserName(result.name);
            setUserId(user.id);
            setLocation(result.barangay);
            router.push("/pet-owner/dashboard");
            return;
          }

          if (result.role === "admin") {
            setUserName(result.name);
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
    // You can show a loading spinner or message while checking authentication.
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
