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
          // Check PersonnelProfiles
          const { data: personnelData } = await supabase
            .from("PersonnelProfiles")
            .select("id, first_name, last_name")
            .eq("id", user.id);

          if (personnelData && personnelData.length > 0) {
            const name = `${personnelData[0]?.first_name} ${personnelData[0]?.last_name}`;
            setUserName(name);
            setUserId(user.id);
            router.push("/personnel/dashboard/registration");
            return;
          }

          // Check PetOwnerProfiles
          const { data: petOwnerData } = await supabase
            .from("PetOwnerProfiles")
            .select("id, first_name, last_name, barangay")
            .eq("id", user.id);

          if (petOwnerData && petOwnerData.length > 0) {
            const name = `${petOwnerData[0]?.first_name} ${petOwnerData[0]?.last_name}`;
            setUserName(name);
            setUserId(user.id);
            setLocation(petOwnerData[0]?.barangay);
            router.push("/pet-owner/dashboard");
            return;
          }

          // No profile in either table = admin
          setUserName("Admin");
          setUserId(user.id);
          router.push("/admin/dashboard/dashboard");
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
