"use client";

import Image from "next/image";
import React, { use, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { redirect } from "next/navigation";

import { supabase } from "@/utils/supabase";
import { LoadingScreenSection } from "./LoadingScreen";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import { createServerClient } from "@supabase/ssr";
// import { Database } from "@/app/lib/database.types";
// import Indicator from "./Indicator";

const SigninComponent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState(
    pathname === "/pet-owner/signin" ? "pet_owner" : "admin"
  );

  //   const supabase2 = createClientComponentClient<Database>();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setLoading(false);
        alert("An error occurred: " + error.message);
      } else {
        const user = data?.user;

        // Check role directly via Supabase queries
        const { data: personnelData } = await supabase
          .from("PersonnelProfiles")
          .select("id")
          .eq("id", user?.id);

        const { data: petOwnerData } = await supabase
          .from("PetOwnerProfiles")
          .select("id")
          .eq("id", user?.id);

        const isPersonnel = personnelData && personnelData.length > 0;
        const isPetOwner = petOwnerData && petOwnerData.length > 0;
        const isAdmin = !isPersonnel && !isPetOwner;

        if (role === "personnel") {
          if (!isPersonnel) {
            setLoading(false);
            alert("You are not a personnel!");
            await supabase.auth.signOut();
            return;
          }
          router.push("/personnel/dashboard/dashboard");
        } else if (role === "pet_owner") {
          if (!isPetOwner) {
            setLoading(false);
            alert("You are not a pet owner!");
            await supabase.auth.signOut();
            return;
          }
          router.push("/pet-owner/dashboard/");
        } else if (role === "admin") {
          if (isAdmin) {
            setLoading(false);
            router.push("/admin/dashboard/dashboard");
            return;
          }
          await supabase.auth.signOut();
          setLoading(false);
        }
      }
      // setLoading(false);
    } catch (error) {
      setLoading(false);

      console.error("An unexpected error occurred:", error);
    }
  };

  return (
    <>
      <div className="min-h-[100svh] h-[100svh] flex flex-col container mx-auto">
        {loading && <LoadingScreenSection />}
        <div className="flex items-center justify-center md:items-start md:justify-start py-20 md:px-4 w-full">
          <button
            className="font-bold text-sm sm:text-lg text-green-700 flex items-center gap-2"
            onClick={() => {
              setLoading(true);
              router.push("/");
            }}>
            <Image
              src={"/pet-vax-modified.svg"}
              width={100}
              height={100}
              alt="Logo"
              className="w-[85px] h-[85px] md:w-[100px] md:h-[100px]"
            />
          </button>
        </div>
        <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 mt-[-50%] sm:mt-[-20%]">
            <div className="flex flex-col items-center">
              <h1 className="font-bold text-3xl text-green-700 pb-8">
                Sign in
              </h1>
              {pathname !== "/pet-owner/signin" && (
                <div className=" grid grid-cols-2 gap-5">
                  <button
                    className={`${
                      role === "admin" ? "bg-green-700" : "bg-gray-400"
                    } text-white rounded-full px-5 py-1`}
                    onClick={() => setRole("admin")}>
                    Admin
                  </button>
                  <button
                    className={`${
                      role === "personnel" ? "bg-green-700" : "bg-gray-400"
                    } text-white rounded-full px-5 py-1`}
                    onClick={() => setRole("personnel")}>
                    Personnel
                  </button>
                </div>
              )}
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <input type="hidden" name="remember" value="true" />
              <div className="rounded-md shadow-sm space-y-2">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full p-3 border border-green-700 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      // autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`input-style-with-condition border-green-700 focus:ring-green-500 focus:border-green-500"
                      }`}
                      placeholder="Password"
                    />
                    <div
                      className="z-0 absolute text-gray-400 right-3 top-1/2 transform -translate-y-1/2 text-2xl"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <IoMdEye /> : <IoMdEyeOff />}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  // onSubmit={handleSubmit}
                  className="group relative w-full flex justify-center p-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-700 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
        <footer className="text-center text-[0.6rem] text-gray-600 p-4">
          <p>
            We adhere to the Data Privacy Act of the Philippines. By using this
            site, you agree to our Privacy Policy.
          </p>
        </footer>
      </div>
    </>
  );
};

export default SigninComponent;
