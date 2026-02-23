"use client";
import { useCallback, useEffect, useState } from "react";
import {
  MdOutlineDelete,
  MdOutlineEdit,
  MdOutlineSearch,
  MdOutlineWarning,
} from "react-icons/md";

import {
  deleteVMSRecord,
  editVMSRecord,
  fetchVMSRecord,
  insertVMSRecord,
} from "@/data/vaccine_management_data";
import { VMSRecord } from "@/types/interfaces";
import { supabase } from "@/utils/supabase";
import { fetchCompleteVaccinationDetailsData } from "@/data/viewCompleteVaccinationDetailsData";
import { LoadingScreenSection } from "../LoadingScreen";

const VMS = () => {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 9;

  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  const [records, setRecords] = useState<any[]>([]);
  const [numOfEntries, setNumOfEntries] = useState(1);

  const [newBatchNumber, setNewBatchNumber] = useState("");
  const [newName, setNewName] = useState("");
  const [newStockInDate, setNewStockInDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newExpirationDate, setNewExpirationDate] = useState("");
  const [newOriginalQty, setNewOriginalQty] = useState("");
  const [newRemaingQty, setNewRemainingQty] = useState("");

  const [batchNumber, setBatchNumber] = useState("");
  const [name, setName] = useState("");
  const [stockInDate, setStockInDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [originalQty, setOriginalQty] = useState("");
  const [remainingQty, setRemainingQty] = useState("");
  const [initialRemainingQty, setInitialRemainingQty] = useState("");
  const [status, setStatus] = useState("");
  const [toggleDistribute, setToggleDistribute] = useState(false);
  const [distributeQty, setDistributeQty] = useState(0);
  const [distributeDate, setDistributeDate] = useState(new Date());
  const [distributeBarangay, setDistributeBarangay] = useState("");

  const [VMSId, setVMSId] = useState("");

  const [viewVaccinationHistory, setViewVaccinationHistory] = useState(false);

  const headerNames = [
    "Lot/Batch No.",
    "Name",
    "Stock-in Date",
    "Expiration Date",
    "Original Qty",
    "Remaining Qty",
    "Status",
    "Action",
  ];

  const headerVaccinationHistory = [
    "Vaccination Date",
    "Pet Name",
    "Pet Owner",
    "Vaccine Name",
    "Location",
  ];

  const memoizedFetchVMSRecordData = useCallback(async () => {
    try {
      const response = await fetchVMSRecord(
        searchValue,
        entriesPerPage,
        currentPage
      );
      if (response?.error) {
        console.error(response.error);
      } else {
        setRecords(response?.data || []);
        setNumOfEntries(response?.count || 1);
        setLoading(false);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [searchValue, entriesPerPage, currentPage, viewVaccinationHistory]);

  useEffect(() => {
    if (!viewVaccinationHistory) {
      memoizedFetchVMSRecordData();

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
              setRecords((prevRecord: any[]) => [
                payload.new as any,
                ...prevRecord,
              ]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [searchValue, entriesPerPage, currentPage, viewVaccinationHistory]);

  // complete vaccination details
  const memoizedFetchCompleteVaccinationDetailsData = useCallback(async () => {
    if (viewVaccinationHistory) {
      try {
        const response = await fetchCompleteVaccinationDetailsData(
          searchValue,
          entriesPerPage,
          currentPage
        );
        if (response?.error) {
          console.error(response.error);
        } else {
          setRecords(response?.data || []);
          setNumOfEntries(response?.count || 1);
          setLoading(false);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  }, [searchValue, entriesPerPage, currentPage, viewVaccinationHistory]);

  useEffect(() => {
    memoizedFetchCompleteVaccinationDetailsData();

    const channel = supabase
      .channel(`realtime sessions`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ViewCompleteVaccinationDetails",
        },
        (payload) => {
          if (payload.new) {
            setRecords((prevRecord: any[]) => [
              payload.new as any,
              ...prevRecord,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchValue, entriesPerPage, currentPage, viewVaccinationHistory]);

  const handleInsertEvent = async (event: any) => {
    event.preventDefault();

    const stockinDate = new Date(newStockInDate);
    const expirationDate = new Date(newExpirationDate);

    const newRecord = {
      batch_number: newBatchNumber,
      name: newName,
      stockin_date: newStockInDate,
      expiration_date: newExpirationDate,
      original_qty: +newOriginalQty,
      remaining_qty: +newOriginalQty,
      status: +newOriginalQty === 0 ? "Unvailable" : "Available",
    };

    const response = await insertVMSRecord(newRecord);
    // console.log("response", response);
    if (response?.error) {
      console.error("Error inserting event:", response.error);
    } else {
      setShowInsertModal(false);

      setNewBatchNumber("");
      setNewName("");
      setNewStockInDate(new Date().toISOString().split("T")[0]);
      setNewExpirationDate("");
      setNewOriginalQty("");
      setNewRemainingQty("");
    }
  };

  const handleEditClick = (id: string) => {
    const record = records.find((record) => record.id === id);

    if (record) {
      setVMSId(record.id);

      setBatchNumber(record.batch_number);
      setName(record.name);
      setStockInDate(record.stockin_date);
      setExpirationDate(record.expiration_date);
      setOriginalQty(record.original_qty.toString());
      setRemainingQty(record.remaining_qty.toString());
      setInitialRemainingQty(record.remaining_qty.toString());

      setShowEditPrompt(true);
    }
  };

  const handleEditEvent = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    // console.log("remainingQty", remainingQty);
    // console.log("status", +remainingQty === 0 ? "Unavailable" : "Available");

    const updatedRecord = {
      batch_number: batchNumber,
      name: name,
      stockin_date: stockInDate,
      expiration_date: expirationDate,
      original_qty: originalQty,
      remaining_qty: remainingQty,
      status: +remainingQty === 0 ? "Unvailable" : "Available",
      // original_qty: +originalQty,
      // remaining_qty: +initialRemainingQty - +remainingQty,
      // status: +remainingQty === 0 ? "Unvailable" : "Available",
      last_modified: new Date().toISOString(),
    };

    await editVMSRecord(VMSId, updatedRecord);

    // if (response) {
    //   await insertDistributedVaccines({
    //     inventory_id: response[0]?.id,
    //     date: new Date(),
    //     num_vaccines: +remainingQty,
    //     barangay: distributeBarangay,
    //   });
    // }

    setRecords((prevRecords) => {
      const filteredRecords = prevRecords.filter(
        (record) => record.id !== VMSId
      );

      const updated = prevRecords.find((record) => record.id === VMSId);
      if (!updated) return prevRecords;

      const updatedRecordFinal = { ...updated, ...updatedRecord };

      return [updatedRecordFinal, ...filteredRecords];
    });
    setShowEditPrompt(false);

    setBatchNumber("");
    setName("");
    setStockInDate("");
    setExpirationDate("");
    setOriginalQty("");
    setRemainingQty("");
    setInitialRemainingQty("");
    setStatus("");
    setToggleDistribute(false);
  };

  const handleDeleteClick = (id: string) => {
    const record = records.find((record) => record.id === id);

    if (record) {
      setVMSId(record.id);

      setShowDeletePrompt(true);
    }
  };

  const handleDeleteEvent = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    await deleteVMSRecord(VMSId);
    setRecords(records.filter((record) => record.id !== VMSId));

    setShowDeletePrompt(false);
  };

  const getExpirationWarning = (expirationDate: string) => {
    const currentDate = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = Math.abs(expDate.getTime() - currentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (expDate < currentDate) {
      return "Already expired";
    } else if (diffDays <= 1) {
      return "Expires in 1 day";
    } else if (diffDays <= 7) {
      return `Expires in ${diffDays} days`;
    } else if (diffDays <= 30) {
      return `Expires in ${Math.ceil(diffDays / 7)} week(s)`;
    } else if (diffDays <= 60) {
      return "Expires in 1 month";
    } else {
      return "";
    }
  };

  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   setLoading(records.length > 0);
  // }, [records, loading]);

  return (
    <>
      <div className="flex flex-col gap-10 h-full">
        {loading && <LoadingScreenSection />}
        {showInsertModal && (
          <div
            className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-auto`}
          >
            <div
              className={`rounded-2xl 
              bg-white text-black mx-3 md:w-[52rem]`}
            >
              <div className="flex justify-between items-center  py-3 px-5">
                {" "}
                <h2 className="text-xl font-semibold">Insert VMS</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowInsertModal(false);

                      setNewBatchNumber("");
                      setNewName("");
                      setNewStockInDate(new Date().toISOString().split("T")[0]);
                      setNewExpirationDate("");
                      setNewOriginalQty("");
                    }}
                    className="bg-red-600 flex text-lg rounded-xl px-3 py-1 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(event) => handleInsertEvent(event)}
                    disabled={
                      !newBatchNumber ||
                      !newName ||
                      !newStockInDate ||
                      !newExpirationDate ||
                      !newOriginalQty
                    }
                    className={`flex text-lg rounded-xl px-3 py-1 text-white ${
                      !newBatchNumber ||
                      !newName ||
                      !newStockInDate ||
                      !newExpirationDate ||
                      !newOriginalQty
                        ? "bg-gray-600"
                        : "bg-green-700"
                    }`}
                  >
                    Insert
                  </button>
                </div>
              </div>
              <hr className="border border-green-700 w-full" />
              <div className="flex flex-col sm:flex-row p-5 gap-3 sm:gap-6 pb-6">
                <>
                  <div className="flex flex-col w-full gap-3">
                    <div>
                      <label htmlFor="newBatchNumber">Lot/Batch No.</label>
                      <input
                        type="text"
                        name="newBatchNumber"
                        id="newBatchNumber"
                        value={newBatchNumber}
                        placeholder="Lot/Batch No."
                        onChange={(e) => setNewBatchNumber(e.target.value)}
                        className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="newName">Name</label>
                      <input
                        type="text"
                        name="newName"
                        id="newName"
                        value={newName}
                        placeholder="Name"
                        onChange={(e) => setNewName(e.target.value)}
                        className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="newOriginalQty">Original Qty</label>
                      <input
                        type="number"
                        name="newOriginalQty"
                        id="newOriginalQty"
                        value={newOriginalQty}
                        placeholder="Original Qty"
                        onChange={(e) => setNewOriginalQty(e.target.value)}
                        className="input-style"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col w-full gap-3">
                    <div>
                      <label htmlFor="newStockInDate">Stock-in Date</label>
                      <input
                        type="date"
                        name="newStockInDate"
                        id="newStockInDate"
                        value={newStockInDate}
                        placeholder="Stock-in Date"
                        onChange={(e) => setNewStockInDate(e.target.value)}
                        className="input-style"
                      />
                    </div>
                    <div>
                      <label htmlFor="newExpirationDate">Expiration Date</label>
                      <input
                        type="date"
                        name="newExpirationDate"
                        id="newExpirationDate"
                        value={newExpirationDate}
                        placeholder="Expiration Date"
                        onChange={(e) => setNewExpirationDate(e.target.value)}
                        className="input-style"
                      />
                    </div>
                  </div>
                </>
              </div>
            </div>
          </div>
        )}

        {showDeletePrompt && (
          <div
            className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black`}
          >
            <div
              className={`rounded-2xl 
           bg-white text-black mx-3 md:w-[26rem]`}
            >
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
                    className="bg-gray-600 flex text-lg rounded-xl px-3 py-1 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(event) => handleDeleteEvent(event)}
                    className={`flex text-lg rounded-xl px-3 py-1 bg-red-600 text-white 
                `}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditPrompt && (
          <div
            className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-auto`}
          >
            <div
              className={`rounded-2xl 
              bg-white text-black mx-3 md:w-[52rem]`}
            >
              <div className="flex justify-between items-center  py-3 px-5">
                {" "}
                <h2 className="text-xl font-semibold">Update Vaccine Info</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditPrompt(false)}
                    className="bg-red-600 flex text-lg rounded-xl px-3 py-1 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(event) => handleEditEvent(event)}
                    disabled={
                      !batchNumber ||
                      !name ||
                      !stockInDate ||
                      !expirationDate ||
                      !originalQty ||
                      !remainingQty
                      // +remainingQty > +initialRemainingQty ||
                      // !distributeBarangay
                      // !status
                    }
                    className={`flex text-lg rounded-xl px-3 py-1 text-white ${
                      !batchNumber ||
                      !name ||
                      !stockInDate ||
                      !expirationDate ||
                      !originalQty ||
                      !remainingQty
                        ? // +remainingQty > +initialRemainingQty ||
                          // !distributeBarangay
                          // !status
                          "bg-gray-600"
                        : "bg-green-700"
                    }`}
                  >
                    Update
                  </button>
                </div>
              </div>
              <hr className="border border-green-700 w-full" />
              <div className="flex flex-col sm:flex-row p-5 gap-3 sm:gap-6 pb-6">
                <>
                  <div className="flex flex-col w-full gap-3">
                    <div>
                      <label htmlFor="batchNumber">Lot/Batch No.</label>
                      <input
                        type="text"
                        name="batchNumber"
                        id="batchNumber"
                        value={batchNumber}
                        placeholder="Lot/Batch No."
                        onChange={(e) => setBatchNumber(e.target.value)}
                        className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        placeholder="Name"
                        onChange={(e) => setName(e.target.value)}
                        className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="stockInDate">Stock-in Date</label>
                      <input
                        type="date"
                        name="stockInDate"
                        id="stockInDate"
                        value={stockInDate}
                        placeholder="Stock-in Date"
                        onChange={(e) => setStockInDate(e.target.value)}
                        className="input-style"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col w-full gap-3">
                    <div>
                      <label htmlFor="expirationDate">Expiration Date</label>
                      <input
                        type="date"
                        name="expirationDate"
                        id="expirationDate"
                        value={expirationDate}
                        placeholder="Expiration Date"
                        onChange={(e) => setExpirationDate(e.target.value)}
                        className="input-style"
                      />
                    </div>
                    <div>
                      <label htmlFor="originalQty">Original Qty</label>
                      <input
                        type="number"
                        name="originalQty"
                        id="originalQty"
                        value={originalQty}
                        placeholder="Original Qty"
                        // readOnly
                        onChange={(e) => setOriginalQty(e.target.value)}
                        className="input-style"
                      />
                    </div>
                    <div>
                      <label htmlFor="remainingQty">
                        {/* {toggleDistribute
                          ? "Number of vaccines to distribute"
                          : "Remaining Qty"} */}
                        Remaining Qty
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          name="remainingQty"
                          id="remainingQty"
                          value={remainingQty}
                          placeholder="Remaining Qty"
                          // readOnly={!toggleDistribute}
                          onChange={(e) => {
                            setRemainingQty(e.target.value);
                          }}
                          className="input-style"
                        />
                        {/* <button
                          className={`${
                            toggleDistribute ? "bg-purple-700" : "bg-blue-700"
                          } text-white rounded-lg px-2 text-sm`}
                          onClick={() => {
                            setToggleDistribute(!toggleDistribute);
                            {
                              !toggleDistribute && setDistributeBarangay("");
                              setRemainingQty(initialRemainingQty);
                            }
                          }}>
                          {toggleDistribute ? "Cancel" : "Distribute"}
                        </button> */}
                      </div>
                    </div>
                    {/* {toggleDistribute && (
                      <>
                        <div>
                          <label htmlFor="distributeBarangay">
                            Barangay to distribute
                          </label>
                          <select
                            name="distributeBarangay"
                            id="distributeBarangay"
                            value={distributeBarangay}
                            onChange={(e) =>
                              setDistributeBarangay(e.target.value)
                            }
                            className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full">
                            <option value=""> -- Select --</option>
                            {locations.map((location) => (
                              <option key={location} value={location}>
                                {location}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )} */}

                    {/* <div>
                      <label htmlFor="status">Status</label>
                      <input
                        type="text"
                        name="status"
                        id="status"
                        value={status}
                        placeholder="Status"
                        onChange={(e) => {
                          setStatus(e.target.value);
                        }}
                        className="input-style"
                      />
                    </div> */}
                    {/* {+remainingQty > +initialRemainingQty && (
                      <p className="text-xs text-end text-red-600">
                        # of vaccines to be distributed should be greater than
                        the initial remaining quantity!
                      </p>
                    )} */}
                  </div>
                </>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center flex-col md:flex-row text-center">
          <h1 className="flex font-bold text-3xl text-green-700 mb-2">
            Vaccine Management System
          </h1>
          <div className="flex gap-2">
            <button
              className="bg-green-700 flex text-lg rounded-xl px-5 py-2 text-white"
              onClick={() => {
                setLoading(true);
                setViewVaccinationHistory(!viewVaccinationHistory);
              }}
            >
              {!viewVaccinationHistory
                ? "Vaccination History"
                : "Vaccine Inventory"}
            </button>
            <button
              type="submit"
              className="bg-green-700 flex text-lg rounded-xl px-5 py-2 text-white"
              onClick={() => setShowInsertModal(true)}
            >
              + Add New Vaccine
            </button>
          </div>
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
          <div className="w-full overflow-x-hidden sm:overflow-y-hidden rounded-t-3xl rounded-b-3xl h-[65dvh] border border-green-700">
            {!viewVaccinationHistory ? (
              <table className="w-full text-sm text-center ">
                <thead className="text-xs uppercase bg-green-700 text-white">
                  <tr>
                    {headerNames.map((header, index) => (
                      <th
                        key={index}
                        scope="col"
                        className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b border-green-700 hover:bg-green-100"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {record.batch_number}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {record.name}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {record.stockin_date}
                      </td>
                      <td className="flex flex-col px-6 py-4 whitespace-nowrap">
                        <h5 className="font-medium text-gray-900">
                          {record.expiration_date}
                        </h5>
                        <h6 className="text-red-700 text-xs">
                          {getExpirationWarning(record.expiration_date)}
                        </h6>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        <button className="bg-purple-700 text-white w-10 rounded-full">
                          {record.original_qty}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        <button className="bg-blue-700 text-white w-10 rounded-full">
                          {record.remaining_qty}
                        </button>
                      </td>
                      {record.status && (
                        <>
                          <td className="px-6 py-4 font-semibold whitespace-nowrap">
                            <button
                              className={`${
                                record?.status &&
                                record.status.toLocaleLowerCase() ===
                                  "available"
                                  ? "bg-green-700"
                                  : "bg-red-700"
                              } text-white rounded-full px-3 py-1`}
                            >
                              {record.status}
                            </button>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center justify-center gap-4 h-full">
                            <button
                              className="text-2xl hover:scale-125 transition delay-75 duration-300 ease-in-out hover:text-blue-600"
                              onClick={() => handleEditClick(record.id)}
                            >
                              <MdOutlineEdit />
                            </button>
                            <button
                              className="text-2xl hover:scale-125 transition delay-75 duration-300 ease-in-out hover:text-red-600"
                              onClick={() => handleDeleteClick(record.id)}
                            >
                              <MdOutlineDelete />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm text-center ">
                <thead className="text-xs uppercase bg-green-700 text-white">
                  <tr>
                    {headerVaccinationHistory.map((header, index) => (
                      <th
                        key={index}
                        scope="col"
                        className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b border-green-700 hover:bg-green-100"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {record.vax_sched_date}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {record.pet_name}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {record.pet_owner}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {record.vaccine_name}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {record.location}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
                disabled={currentPage === 1}
              >
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
                disabled={records.length < entriesPerPage}
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VMS;
