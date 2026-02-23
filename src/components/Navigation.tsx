"use client";

import React, { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { NavigationProps } from "@/types/interfaces";

const Navigation = ({ children }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <section className="flex w-screen overflow-x-hidden h-[100dvh] bg-gray-200">
      <div
        className={`
        ${!isMenuOpen ? "xl:w-0" : "xl:w-[20%]"} fixed left-0 md:static z-50`}>
        <Sidebar isMenuOpen={isMenuOpen} handleMenuClick={handleMenuClick} />
      </div>
      <div
        className={`${
          isMenuOpen ? "xl:w-[80%]" : "xl:w-[100%]"
        }  w-full h-[93dvh] px-5 z-0`}>
        <Topbar isMenuOpen={isMenuOpen} handleMenuClick={handleMenuClick} />
        {/* <div className="w-full flex flex-col content-stretch"> */}
        {children}
        {/* </div> */}
      </div>
    </section>
  );
};
export default Navigation;
