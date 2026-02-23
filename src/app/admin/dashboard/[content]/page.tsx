"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import Overview from "@/components/admin/Overview";
import PetAndOwner from "@/components/PetAndOwner";
import VaxSched from "@/components/VaxSched";
import Personnel from "@/components/admin/Personnel";
import Settings from "@/components/admin/Settings";

const Content = () => {
  const router = useRouter();
  const path = usePathname();

  let activeComponent, activePath;

  switch (path) {
    case "/admin/dashboard/dashboard":
      activePath = "Dashboard";
      activeComponent = <Overview />;
      break;
    case "/admin/dashboard/pets":
      activePath = "Pet and Owner Records";
      activeComponent = <PetAndOwner />;
      break;
    case "/admin/dashboard/schedule":
      activePath = "Vaccination Schedule";
      activeComponent = <VaxSched />;
      break;
    case "/admin/dashboard/personnel":
      activePath = "Personnel Management System";
      activeComponent = <Personnel />;
      break;
    case "/admin/dashboard/settings":
      activePath = "Settings";
      activeComponent = <Settings />;
      break;
    default:
      activeComponent = null;
  }

  return (
    <div
      className={`${
        path !== "/admin/dashboard/dashboard" &&
        "rounded-3xl bg-white shadow-lg py-6 px-6"
      }  font-RobotoCondensed overflow-x-hidden h-full`}>
      {/* <h1 className="mb-10 font-bold text-3xl">{activePath}</h1> */}
      <div>{activeComponent}</div>
    </div>
  );
};

export default Content;
