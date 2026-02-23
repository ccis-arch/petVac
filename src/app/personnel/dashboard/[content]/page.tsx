"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import Overview from "@/components/admin/Overview";
import PetAndOwner from "@/components/PetAndOwner";
import VaxSched from "@/components/VaxSched";
import Personnel from "@/components/admin/Personnel";
import Settings from "@/components/admin/Settings";
import VMS from "@/components/personnel/VMS";
import RegistrationInfo from "@/components/personnel/RegistrationInfo";
import Appointments from "@/components/personnel/Appointments";

const Content = () => {
  const router = useRouter();
  const path = usePathname();

  let activeComponent, activePath;

  switch (path) {
    case "/personnel/dashboard/registration":
      activePath = "Registration";
      activeComponent = <RegistrationInfo />;
      break;
    case "/personnel/dashboard/pets":
      activePath = "Pet Records";
      activeComponent = <PetAndOwner />;
      break;
    case "/personnel/dashboard/schedule":
      activePath = "Vaccination Schedule";
      activeComponent = <VaxSched />;
      break;
    case "/personnel/dashboard/vms":
      activePath = "VMS";
      activeComponent = <VMS />;
      break;
    case "/personnel/dashboard/appointments":
      activePath = "Appointments";
      activeComponent = <Appointments />;
      break;
    default:
      activeComponent = null;
  }

  return (
    <div
      className="rounded-3xl bg-white shadow-lg py-6 px-6
        font-RobotoCondensed overflow-x-hidden h-full">
      <div>{activeComponent}</div>
    </div>
  );
};

export default Content;
