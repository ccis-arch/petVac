"use client";

import {
  deleteAppointmentRecord,
  fetchAppointmentRecordView,
} from "@/data/appointmentData";
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useState } from "react";
import {
  MdOutlineDelete,
  MdOutlineSearch,
  MdOutlineWarning,
} from "react-icons/md";
import { LoadingScreenSection } from "../LoadingScreen";
import { editPetRecord } from "@/data/pet_records_data";
import { editVMSRecord } from "@/data/vaccine_management_data";

const Appointments = () => {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 9;
  const [numOfEntries, setNumOfEntries] = useState(1);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");

  // interface AppointmentRecord {
  //   id: string;
  //   PetOwnerProfiles: {
  //     first_name: string;
  //     last_name: string;
  //   };
  //   ticket_num: string;
  //   VaccinationSchedule: {
  //     start_date: string;
  //     start_time: string;
  //     end_time: string;
  //     location: string;
  //   };
  //   time: string;
  // }

  const [records, setRecords] = useState<any[]>([]);

  const headerNames = [
    "Ticket Number",
    "Pet Name",
    "Pet Owner",
    "Location",
    "Vaccine Name",
    "Schedule",
    "Time",
    "Status",
    "Action",
  ];

  const memoizedFetchAppointmentRecordViewData = useCallback(async () => {
    let data: any[] | null = null;

    try {
      const response = await fetchAppointmentRecordView(
        searchValue,
        entriesPerPage,
        currentPage
      );
      if (response?.error) {
        console.error(response.error);
      } else {
        setRecords(response?.data || []);
        data = response?.data || null;
        // console.log("response?.data1111", response?.data);
        setNumOfEntries(response?.count || 1);
        setLoading(false);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
    return data;
  }, [searchValue, entriesPerPage, currentPage]);

  useEffect(() => {
    memoizedFetchAppointmentRecordViewData();

    const channel = supabase
      .channel(`realtime apppointment personnel sessions`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "AppointmentRecords",
        },
        async (payload) => {
          if (payload.new) {
            if (payload.new) {
              const updatedData =
                await memoizedFetchAppointmentRecordViewData();
              setRecords(updatedData || []);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "AppointmentRecords",
        },
        async (payload) => {
          if (payload.new) {
            const updatedData = await memoizedFetchAppointmentRecordViewData();
            setRecords(updatedData || []);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchValue, entriesPerPage, currentPage]);

  const handleDeleteClick = (id: string) => {
    const record = records.find((record) => record.id === id);

    if (record) {
      setAppointmentId(record.id);

      setShowDeletePrompt(true);
    }
  };

  const handleDeleteEvent = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    await deleteAppointmentRecord(appointmentId);
    // setRecords(records.filter((record) => record.id !== appointmentId));

    const recordToDeleteAndUpdate = records.find(
      (record) => record.id === appointmentId
    );

    if (recordToDeleteAndUpdate) {
      const appointmentYear = new Date(
        recordToDeleteAndUpdate.appointment_date
      ).getFullYear();
      const vaccinationYear = recordToDeleteAndUpdate.date_vaccinated
        ? new Date(recordToDeleteAndUpdate.date_vaccinated).getFullYear()
        : null;

      // if record year of the appointment date is equal to record year of the date_vaccinated
      if (appointmentYear === vaccinationYear) {
        const updatedRecord = {
          date_vaccinated: null,
        };
        await editPetRecord(recordToDeleteAndUpdate.pet_id, updatedRecord);
      }

      const updateVaccineRemaining = {
        remaining_qty: (recordToDeleteAndUpdate.vaccine_qty || 0) + 1,
        status:
          recordToDeleteAndUpdate.vaccine_qty === 0
            ? "Unvailable"
            : "Available",
      };

      await editVMSRecord(
        recordToDeleteAndUpdate.vaccine_id,
        updateVaccineRemaining
      );
    }

    setShowDeletePrompt(false);
  };

  const [loading, setLoading] = useState(true);

  return (
    <div className="flex flex-col gap-10 h-full">
      {loading && <LoadingScreenSection />}

      {showDeletePrompt && (
        <div
          className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black`}>
          <div
            className={`rounded-2xl 
           bg-white text-black mx-3 md:w-[26rem]`}>
            <div className="flex flex-col items-center justify-center text-center w-full p-5 gap-3">
              <div className="text-6xl text-yellow-600">
                <MdOutlineWarning />
              </div>
              <p>Are you sure you want to delete this information?</p>
            </div>
            <hr className=" border border-green-700 w-full" />
            <div className="flex justify-center items-center  py-3 px-5">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeletePrompt(false)}
                  className="bg-gray-600 flex text-lg rounded-xl px-3 py-1 text-white">
                  Cancel
                </button>
                <button
                  onClick={(event) => handleDeleteEvent(event)}
                  className={`flex text-lg rounded-xl px-3 py-1 bg-red-600 text-white 
                `}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center flex-col md:flex-row">
        <h1 className="flex font-bold text-3xl text-green-700 ">
          Appointments
        </h1>
      </div>
      <div className="flex flex-col gap-5">
        <div className="self-end relative">
          <MdOutlineSearch className="z-0 absolute text-gray-400 left-3 top-1/2 transform -translate-y-1/2 text-2xl" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search"
            className="w-full border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-full pl-10 py-2"
          />
        </div>
        <div className="w-full overflow-x-auto sm:overflow-y-hidden rounded-t-3xl rounded-b-3xl h-[65dvh] border border-green-700">
          <table
            className={`${
              records.length === 0 && "h-full"
            } w-full text-sm text-center`}>
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
              {records.length > 0 ? (
                records.map((record, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b border-green-700 hover:bg-green-100">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record.ticket_num}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record.pet_name}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record?.pet_owner}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record?.vaccine_location}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record?.vaccine_name ? record.vaccine_name : "N/A"}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record.appointment_date}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-appointment_time">
                      {record.appointment_date}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-appointment_time">
                      <div
                        className={`${
                          record.status === "ved" ? "bg-blue-700" : "bg-red-700"
                        } text-white w-16 rounded-full py-1 px-2`}>
                        {record.status === "ved" ? "Ved" : "Uved"}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center justify-center gap-4 h-full">
                      <button
                        className="text-2xl hover:scale-125 transition delay-75 duration-300 ease-in-out hover:text-red-600"
                        onClick={() => handleDeleteClick(record.id)}>
                        <MdOutlineDelete />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
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

export default Appointments;
