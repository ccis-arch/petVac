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
          setUser(data.user);
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
            router.push("/personnel/dashboard/dashboard");
            return;
          }

          if (data.role === "pet-owner") {
            router.push("/pet-owner/dashboard");
            return;
          }

          if (data.role === "admin") {
            router.push("/admin/dashboard/dashboard");
            return;
          }
        } catch (error) {
          console.error("Error checking role:", error);
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
