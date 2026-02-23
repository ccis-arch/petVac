import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  IoHomeOutline,
  IoPeopleOutline,
  IoClipboardOutline,
  IoCalendarOutline,
  IoArchiveOutline,
  IoSettingsOutline,
  IoMenuOutline,
} from "react-icons/io5";
import { BsListTask } from "react-icons/bs";

import { MdOutlinePets } from "react-icons/md";

import { AiOutlineSchedule } from "react-icons/ai";
import { SidebarProps, Button } from "@/types/interfaces";

const Sidebar: React.FC<SidebarProps> = ({ isMenuOpen, handleMenuClick }) => {
  const router = useRouter();
  const pathname = usePathname();

  const userType = pathname.includes("/admin/")
    ? "admin"
    : pathname.includes("/personnel/")
    ? "personnel"
    : null;

  const adminButtons: Button[] = [
    {
      path: "/admin/dashboard/dashboard",
      label: "Dashboard",
      icon: <IoHomeOutline />,
    },
    {
      path: "/admin/dashboard/pets",
      label: "Pet and Owner",
      icon: <IoClipboardOutline />,
    },
    {
      path: "/admin/dashboard/schedule",
      label: "Vaccination Schedule",
      icon: <AiOutlineSchedule />,
    },
    {
      path: "/admin/dashboard/personnel",
      label: "Personnel",
      icon: <IoPeopleOutline />,
    },
    {
      path: "/admin/dashboard/settings",
      label: "Settings",
      icon: <IoSettingsOutline />,
    },
  ];

  const personnelButtons: Button[] = [
    {
      path: "/personnel/dashboard/registration",
      label: "Registration",
      icon: <IoClipboardOutline />,
    },
    {
      path: "/personnel/dashboard/pets",
      label: "Pet Records",
      icon: <MdOutlinePets />,
    },
    {
      path: "/personnel/dashboard/schedule",
      label: "Vaccination Schedule",
      icon: <AiOutlineSchedule />,
    },
    {
      path: "/personnel/dashboard/vms",
      label: "VMS",
      icon: <IoArchiveOutline />,
    },
    {
      path: "/personnel/dashboard/appointments",
      label: "Appointments",
      icon: <BsListTask />,
    },
  ];

  const buttons =
    userType === "admin"
      ? adminButtons
      : userType === "personnel"
      ? personnelButtons
      : [];

  // Check if the current path matches the button's path
  const isCurrentPath = (buttonPath: string) => pathname === buttonPath;

  return (
    <div className="bg-green-800 font-RobotoCondensed select-none transition-all duration-500 z-10 overflow-y-auto md:overflow-y-hidden">
      <div
        className={`
        ${isMenuOpen ? "flex" : "hidden"}
            w-full h-[5dvh] self-center items-center justify-end flex p-5 text-3xl text-white 
        }`}>
        <button onClick={handleMenuClick}>
          <IoMenuOutline />
        </button>
      </div>

      <div
        className={`${
          isMenuOpen ? "hidden md:block" : "block md:hidden"
        } h-[95dvh] flex-col bg-green-800 text-white items-center gap-14 space-y-10 lg:space-y-20`}>
        <div className="rounded-3xl overflow-hidden self-center flex justify-center items-center">
          <Image
            src={"/pet-vax-modified.svg"}
            width={200}
            height={200}
            alt="Logo"
            className="w-[150px] h-[150px] md:w-[200px] md:h-[200px]"
          />
        </div>
        <div className="flex flex-col space-y-5">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => {
                router.push(button.path);
                // handleMenuClick();
              }}
              className={`${
                isCurrentPath(button.path) && "bg-green-700  items-center"
              } py-4 px-16 md:px-18 w-full flex text-lg items-center gap-x-6 whitespace-nowrap`}>
              <span>{button.icon}</span>
              {button.label}
            </button>
          ))}
        </div>
        {/*   absolute bottom-12*/}
        <div className="w-full flex gap-12 items-center justify-center md:mt-10 pb-8 md:pb-0">
          <Image
            className="bg-[#0DB774] rounded-full p-1"
            src="/bunawan_logo.svg"
            width={75}
            height={75}
            alt="Bunawan Logo"
          />
          <Image
            className="bg-[#0DB774] rounded-full p-1"
            src="/agriculture_dept.svg"
            width={75}
            height={75}
            alt="Bunawan Logo"
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
