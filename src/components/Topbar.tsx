"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { IoMenuOutline, IoSettingsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { CiExport } from "react-icons/ci";
import { IoLogOutOutline } from "react-icons/io5";
import { useState } from "react";
import { usePathname } from "next/navigation";
import path from "path";
import { TopbarProps, MenuButtonProps } from "@/types/interfaces";
import { useRouter } from "next/navigation";

import { supabase } from "@/utils/supabase";
import { useContext } from "react";
import { UserContext } from "@/utils/UserContext";
import {
  MdOutlineAnnouncement,
  MdOutlineDelete,
  MdOutlineNotificationsNone,
} from "react-icons/md";
import { exportGraphsToPdf } from "./admin/Graphs";
import {
  deleteAdminNotification,
  deleteAllAdminNotifications,
  getAdminNotifications,
} from "@/data/adminNotificationsData";
import { LoadingScreenFullScreen, LoadingScreenSection } from "./LoadingScreen";

const Topbar: React.FC<TopbarProps> = ({ isMenuOpen, handleMenuClick }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const [showLogout, setShowLogout] = useState(false);
  const [toggleExport, setToggleExport] = useState(false);

  const [selectedOption, setSelectOption] = useState("graphs");

  const { userName, userId } = useContext(UserContext);
  const userType = pathname.includes("/admin") ? "admin" : "anon";

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowLogout(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dropdownRefExport = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRefExport.current &&
        !dropdownRefExport.current.contains(event.target as Node)
      ) {
        setToggleExport(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function jsonToCsv(json: any) {
    const items = json;
    const replacer = (key: any, value: any) => (value === null ? "" : value);
    const header = Object.keys(items[0]);
    let csv = items.map((row: { [key: string]: any }) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    );
    csv.unshift(header.join(","));
    csv = csv.join("\r\n");
    return csv;
  }

  const componentRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (selectedOption === "General Report") {
    } else if (selectedOption === "graphs") {
      exportGraphsToPdf();
    } else if (
      selectedOption === "PetOwnerProfiles" ||
      selectedOption === "PetRecords" ||
      selectedOption === "VaccinationSchedule" ||
      selectedOption === "PersonnelProfiles" ||
      selectedOption === "VaccineInventory"
    ) {
      const { data, error } = await supabase.from(selectedOption).select();
      if (error) {
        console.error(error);
      } else {
        // Capitalize first letter and replace underscores with spaces
        const modifiedData = data.map((item) => {
          const newItem: { [key: string]: any } = {};
          for (const key in item) {
            const newKey = key
              .replace(/_/g, " ")
              .replace(/^\w/, (c) => c.toUpperCase());
            newItem[newKey] = item[key];
          }
          return newItem;
        });

        // Convert JSON to CSV
        const csv = jsonToCsv(modifiedData);

        // Download CSV
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${selectedOption}.csv`;
        link.click();
      }
    }
    setToggleExport(false);
  };

  const [showNotifications, setShowNotifications] = useState(false);

  const dropdownRefNotif = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRefNotif.current &&
        !dropdownRefNotif.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [notifications, setNotifications] = useState<any[]>([]);

  const memoizedFetchAdminNotificationsData = useCallback(async () => {
    try {
      const response = await getAdminNotifications();
      if (response?.error) {
        console.error(response.error);
      } else {
        setNotifications(response?.data || []);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, []);

  useEffect(() => {
    memoizedFetchAdminNotificationsData();

    const channel = supabase
      .channel(`realtime admin notification sessions`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "AdminNotifications",
        },
        (payload) => {
          if (payload.new) {
            setNotifications((prevRecord) => [payload.new, ...prevRecord]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "AdminNotifications",
        },
        (payload) => {
          if (payload.old) {
            setNotifications((prevRecord: any) =>
              prevRecord.filter((record: any) => record.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [toggleClear, setToggleClear] = useState(false);

  return (
    <>
      {toggleExport && (
        <div
          className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-auto w-full`}>
          <div
            className={`rounded-2xl 
                bg-white text-black mx-3 md:w-96`}
            ref={dropdownRefExport}>
            <div className="flex justify-between items-center  py-3 px-5">
              <h2 className="text-xl font-semibold">Export Data</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setToggleExport(false);
                  }}
                  className="bg-red-600 flex text-lg rounded-xl px-3 py-1 text-white">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleExport();
                  }}
                  className={`bg-green-700 flex text-lg rounded-xl px-3 py-1 text-white `}>
                  Export
                </button>
              </div>
            </div>
            <hr className="border border-green-700 w-full" />
            <div className="flex flex-col sm:flex-row items-center p-5 gap-2 sm:gap-6 pb-6">
              <>
                <label htmlFor="selectedOption" className="whitespace-nowrap">
                  Export
                </label>
                <select
                  name="selectedOption"
                  id="selectedOption"
                  value={selectedOption}
                  onChange={(e) => setSelectOption(e.target.value)}
                  className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full">
                  {/* <option value="General Report">General Report</option> */}
                  <option value="graphs">Graphs</option>
                  <option value="PetOwnerProfiles">Pet Owners</option>
                  <option value="PetRecords">Pets</option>
                  <option value="VaccinationSchedule">Schedules</option>
                  {userType === "admin" && (
                    <option value="PersonnelProfiles">Personnels</option>
                  )}
                  <option value="VaccineInventory">Vaccine Inventory</option>
                </select>
              </>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center py-2 h-[5dvh]">
        {/* {loading && <LoadingScreenFullScreen />} */}
        <MenuButton onClick={handleMenuClick} isMenuOpen={isMenuOpen} />
        <div className="flex gap-3 md:gap-5">
          <div
            className="relative flex items-center justify-center space-x-4"
            ref={dropdownRefNotif}>
            <button
              className="flex items-center text-2xl space-x-2"
              onClick={() => {
                setShowNotifications(!showNotifications);
              }}>
              <MdOutlineNotificationsNone />
            </button>
            {showNotifications && (
              <div
                className={`${
                  userType !== "admin" ? "" : ""
                } absolute top-full mt-2 bg-gray-600 opacity-95 text-gray-400 py-2 pr-8 md:pr-0 px-3 w-[18rem] md:w-96 h-60 -right-52 md:-left-56 rounded-lg z-40 flex flex-col`}>
                <div className="absolute w-3 h-3 bg-inherit transform rotate-45 left-[47.5%] md:left-3/4 -top-1.5 translate-x-[-620%]" />
                {userType === "admin" && (
                  <div className="flex items-center self-end pr-3 gap-4">
                    <button onClick={() => setToggleClear(!toggleClear)}>
                      {toggleClear ? "Cancel" : "Clear"}
                    </button>
                    {/* {toggleClear && (
                    <button onClick={() => deleteAllAdminNotifications()}>
                      Clear All
                    </button>
                  )} */}
                  </div>
                )}
                <div className="w-full py-3 px-2 text-md opacity-100 text-green-300 flex flex-col gap-5 overflow-y-auto scrollbar-hide">
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-700 text-white rounded-full p-2 ">
                          <MdOutlineAnnouncement />
                        </div>
                        <div>
                          <h5 className="w-full whitespace-normal word-wrap">
                            {notification.message}
                          </h5>
                          <h6 className="text-xs text-blue-400">
                            {new Date(notification.created_at).toLocaleString()}
                          </h6>
                        </div>
                      </div>
                      {toggleClear && (
                        <button
                          onClick={() =>
                            deleteAdminNotification(notification.id)
                          }>
                          <div className="text-xl p-2 text-red-600">
                            <MdOutlineDelete />
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className="relative flex items-center justify-center space-x-4"
            ref={dropdownRef}>
            <button
              className="flex items-center text-2xl space-x-2"
              onClick={() => setShowLogout(!showLogout)}>
              <CgProfile />
              <h5 className="text-base md:text-xl">
                Hi,{" "}
                <span className="text-green-700 font-semibold">{userName}</span>
              </h5>
            </button>
            {showLogout && (
              <div className="absolute top-full mt-2 bg-gray-600 text-gray-400 opacity-95 py-2 pl-3 pr-14 right-[0.20rem] rounded-lg z-40">
                <div className="absolute w-3 h-3 bg-inherit transform rotate-45 left-3/4 -top-1.5 translate-x-[-50%]" />
                <button
                  className="flex items-center text-lg space-x-2 text-green-300 hover:text-red-300 my-3"
                  onClick={() => {
                    setToggleExport(true);
                    setShowLogout(false);
                  }}>
                  <div className="bg-green-700 text-white rounded-full p-2">
                    <CiExport />
                  </div>
                  <h5 className="text-md whitespace-nowrap">Data Export</h5>
                </button>
                <button
                  className="flex items-center text-lg space-x-2 text-green-300 hover:text-red-300 my-3"
                  onClick={() => {
                    setLoading(true);
                    supabase.auth.signOut();
                    localStorage.removeItem("name");
                    localStorage.removeItem("userId");
                    router.push("/");
                  }}>
                  <div className="bg-green-700 text-white rounded-full p-2 ">
                    <IoLogOutOutline />
                  </div>

                  <h5 className="text-md">Logout</h5>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, isMenuOpen }) => {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-center gap-10">
      <button
        className={` ${isMenuOpen ? "hidden" : "flex"} text-3xl self-center`}
        onClick={onClick}>
        <IoMenuOutline />
      </button>
      {pathname === "/admin/dashboard/dashboard" && (
        <h1 className="hidden md:flex font-bold text-3xl text-green-700">
          Overview
        </h1>
      )}
    </div>
  );
};

export default Topbar;
