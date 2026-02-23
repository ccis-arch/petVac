"use client";

import { locations } from "@/data/barangayData";
import {
  editPetOwnerRecord,
  fetchPetOwnerRecord,
  fetchPetOwnerRecordByFilter,
} from "@/data/pet_owners_data";
import { PetCount, PetOwner } from "@/types/interfaces";
import { supabase } from "@/utils/supabase";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IoFilterOutline, IoCloseOutline } from "react-icons/io5";
import {
  MdOutlineDelete,
  MdOutlineEdit,
  MdOutlineSearch,
} from "react-icons/md";
import { LoadingScreenSection } from "../LoadingScreen";

const RegistrationInfo = () => {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 9;

  const [records, setRecords] = useState<PetOwner[]>([]);
  const [numOfEntries, setNumOfEntries] = useState(1);

  const [petCounts, setPetCounts] = useState<PetCount[]>([]);

  const [dateSelector, setDateSelector] = useState("");
  const [locationSelector, setLocationSelector] = useState("");

  const [isFilterOn, setIsFilterOn] = useState(false);

  const headerNames = [
    "ID Number",
    "Date Registered",
    "Last Name",
    "First Name",
    "Gender",
    "Birthdate",
    "Barangay",
    "Phone Number",
    "Pets Owned",
    // "Status",
  ];

  const memoizedFetchPetOwnerRecordsData = useCallback(async () => {
    try {
      let response;
      if (isFilterOn) {
        response = await fetchPetOwnerRecordByFilter(
          dateSelector,
          locationSelector,
          entriesPerPage,
          currentPage
        );
      } else {
        response = await fetchPetOwnerRecordByFilter(
          "",
          "",
          entriesPerPage,
          currentPage
        );
      }
      setRecords(response?.data || []);
      setPetCounts(response?.petCounts || []);
      setNumOfEntries(response?.count || 1);
      setLoading(false);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [isFilterOn, entriesPerPage, currentPage, dateSelector, locationSelector]);

  useEffect(() => {
    memoizedFetchPetOwnerRecordsData();

    const channel = supabase
      .channel(`realtime sessions`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "VaccineInventory",
        },
        (payload) => {
          if (payload.new) {
            setRecords((prevRecord: PetOwner[]) => [
              payload.new as PetOwner,
              ...prevRecord,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isFilterOn, entriesPerPage, currentPage, dateSelector, locationSelector]);

  useEffect(() => {
    if (!isFilterOn) {
      setDateSelector("");
      setLocationSelector("");
    }
  }, [isFilterOn]);

  const [loading, setLoading] = useState(true);

  return (
    <div className="z-0 flex flex-col gap-10 h-full">
      {loading && <LoadingScreenSection />}
      <div className="flex justify-between items-center flex-col md:flex-row">
        <h1 className="flex font-bold text-3xl text-green-700 ">
          Registration
        </h1>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex self-end gap-5">
          <input
            type="date"
            name="dateSelector"
            id="dateSelector"
            value={dateSelector}
            onChange={(e) => setDateSelector(e.target.value)}
            className="input-style"
          />
          <select
            value={locationSelector}
            onChange={(e) => setLocationSelector(e.target.value)}
            name="locationSelector"
            id="locationSelector"
            className="input-style">
            <option value=""> -- All --</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <button
            className={`flex items-center justify-center gap-3 bg-green-700 text-lg rounded-xl px-5 py-2 text-white ${
              isFilterOn ? "bg-red-600" : "bg-green-700"
            }`}
            onClick={() => setIsFilterOn(!isFilterOn)}>
            {isFilterOn ? <IoCloseOutline /> : <IoFilterOutline />}

            {/* <p>Filter</p> */}
          </button>
        </div>
        <div className="w-full overflow-x-auto sm:overflow-y-hidden rounded-t-3xl rounded-b-3xl h-[65dvh] border border-green-700">
          <table className="w-full text-sm text-center ">
            <thead className="text-xs uppercase bg-green-700 text-white">
              <tr>
                {headerNames.map((header, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr
                  key={index}
                  className="bg-white border-b border-green-700 hover:bg-green-100">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {(record as PetOwner).id}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {new Date(
                      (record as PetOwner).date_registered
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {(record as PetOwner).last_name}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {(record as PetOwner).first_name}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {(record as PetOwner).gender}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {new Date(
                      (record as PetOwner).birth_date
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {(record as PetOwner).barangay}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {(record as PetOwner).phone_number}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {petCounts.find(
                      (count) => count.owner_id === (record as PetOwner).id
                    )?.pet_count || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center w-full">
          <p className="text-sm text-gray-600">
            Entry {currentPage} of {Math.ceil(numOfEntries / entriesPerPage)}
          </p>
          <div className="flex select-none">
            <button
              className={`${
                currentPage === 1
                  ? "bg-white text-white"
                  : "bg-green-700 text-white"
              } rounded-3xl py-2 px-5`}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}>
              {"<"}
            </button>
            <input
              type="number"
              min="1"
              max={Math.ceil(numOfEntries / 10)}
              value={currentPage}
              onChange={(e) => {
                const pageNumber = Number(e.target.value);
                if (
                  pageNumber >= 1 &&
                  pageNumber <= Math.ceil(numOfEntries / 10)
                ) {
                  setCurrentPage(pageNumber);
                }
              }}
              className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-full text-center px-5 mx-2"
            />
            <button
              className={`${
                records.length < entriesPerPage
                  ? "bg-white text-white"
                  : "bg-green-700 text-white"
              } rounded-3xl py-2 px-5`}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={records.length < entriesPerPage}>
              {">"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationInfo;
