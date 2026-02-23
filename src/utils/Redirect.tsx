"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "./supabase";
import { LoadingScreenFullScreen } from "@/components/LoadingScreen";

type User = any;

const Redirect = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error && error.status === 401) {
          console.error("User is not authenticated.");
        } else if (error) {
          console.error("Error fetching user:", error.message);
        } else if (
          data &&
          (pathname === "/admin/signin" || pathname === "/pet-owner/signin")
        ) {
          // User is already logged in and is on the '/signin' route, redirect to '/dashboard'
          setUser(data.user);
          //   router.push("/dashboard");
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pathname]);

  useEffect(() => {
    if (user) {
      const checkRole = async () => {
        const { data: personnelData } = await supabase
          .from("PersonnelProfiles")
          .select("id")
          .eq("id", user.id);

        if (personnelData && personnelData.length > 0) {
          router.push("/personnel/dashboard/dashboard");
          return;
        }

        const { data: petOwnerData } = await supabase
          .from("PetOwnerProfiles")
          .select("id")
          .eq("id", user.id);

        if (petOwnerData && petOwnerData.length > 0) {
          router.push("/pet-owner/dashboard");
          return;
        }

        const { data: adminData1 } = await supabase
          .from("PersonnelProfiles")
          .select("id")
          .eq("id", user.id);

        const { data: adminData2 } = await supabase
          .from("PetOwnerProfiles")
          .select("id")
          .eq("id", user.id);

        if (
          (adminData1 && adminData1.length) === 0 ||
          (adminData2 && adminData2.length === 0)
        ) {
          router.push("/admin/dashboard/dashboard");
          return;
        }
      };

      checkRole();
    }
  }, [user, pathname, router]);

  if (isLoading) {
    return <LoadingScreenFullScreen />;
  }

  if (!user) {
    return <>{children}</>;
  }
};

export default Redirect;
