"use client";

import React, { useState, useEffect } from "react";
import { supabase, supabaseAdmin } from "../utils/supabase";
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
        const { data: personnelData } = await supabaseAdmin
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

        const { data: adminData1 } = await supabaseAdmin
          .from("PersonnelProfiles")
          .select("id")
          .eq("id", user.id);

        const { data: adminData2 } = await supabaseAdmin
          .from("PetOwnerProfiles")
          .select("id")
          .eq("id", user.id);

        if (
          (adminData1 && adminData1.length) === 0 ||
          (adminData2 && adminData2.length === 0)
        ) {
          setUserName("Admin");
          setUserId(user.id);
          router.push("/admin/dashboard/dashboard");
          return;
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
