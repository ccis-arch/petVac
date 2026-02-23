"use client";
import { useCallback, useEffect, useState } from "react";
import {
  MdOutlineDelete,
  MdOutlineEdit,
  MdOutlineSearch,
  MdOutlineWarning,
} from "react-icons/md";

import {
  createPersonnelUser,
  fetchPersonnelUserRecord,
  deletePersonnelUserRecord,
  editPersonnelUserRecord,
} from "@/data/personnelData";
import { LoadingScreenSection } from "../LoadingScreen";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

const Personnel = () => {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 9;
  const [showInsertModal, setShowInsertModal] = useState(false);

  const [records, setRecords] = useState<Record<string, any>[]>([]);
  const [numOfEntries, setNumOfEntries] = useState(1);

  const [newPersonnelUserId, setNewPersonnelUserId] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newLastName, setNewLastName] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const [personnelUserId, setPersonnelUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  const [currentPersonnelUserId, setCurrentPersonnelUserId] = useState("");
  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  const [error, setError] = useState("");

  const headerNames = [
    "Personnel ID",
    "Email",
    "Password",
    "Last Name",
    "First Name",
    "Phone Number",
    "Address",
    "Action",
  ];

  const memoizedFetchPersonnelUserRecordData = useCallback(async () => {
    try {
      const response = await fetchPersonnelUserRecord(
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
  }, [searchValue, entriesPerPage, currentPage]);

  useEffect(() => {
    memoizedFetchPersonnelUserRecordData();
  }, [searchValue, entriesPerPage, currentPage]);

  const handleInsertEvent = async (event: any) => {
    event.preventDefault();

    // if (newPassword.length < 8) {
    //   setError("Password must be at least 8 characters");
    //   return;
    // }

    const newRecord = {
      email: newEmail,
      password: newPassword,
      last_name: newLastName,
      first_name: newFirstName,
      phone_number: newPhoneNumber,
      address: newAddress,
    };

    try {
      const profileData = await createPersonnelUser(
        newEmail,
        newPassword,
        newRecord
      );
      // console.log("User created successfully:", profileData?.userID);

      const data = {
        id: profileData?.userID,
        email: newEmail,
        password: newPassword,
        last_name: newLastName,
        first_name: newFirstName,
        phone_number: newPhoneNumber,
        address: newAddress,
      };

      setRecords([...records, data]);

      setNewEmail("");
      setNewPassword("");
      setNewLastName("");
      setNewFirstName("");
      setNewPhoneNumber("");
      setNewAddress("");
      setShowInsertModal(false);
    } catch (error) {
      // console.error("Failed to create user:", error);
      alert(
        "Failed to create user: A user with this email address has already been registered."
      );
    }
  };

  const handleEditClick = (id: string) => {
    const record = records.find((record) => record.id === id);

    if (record) {
      setPersonnelUserId(record.id);
      setEmail(record.email);
      setPassword(record.password);
      setLastName(record.last_name);
      setFirstName(record.first_name);
      setPhoneNumber(record.phone_number);
      setAddress(record.address);

      setShowEditPrompt(true);
    }
  };

  const handleUpdateEvent = async (event: any) => {
    event.preventDefault();

    const updatedRecord = {
      id: personnelUserId,
      email,
      password,
      last_name: lastName,
      first_name: firstName,
      phone_number: phoneNumber,
      address,
    };

    await editPersonnelUserRecord(personnelUserId, updatedRecord);
    setShowEditPrompt(false);

    setRecords(
      records.map((record) => {
        if (record.id === personnelUserId) {
          return {
            ...record,
            email,
            password,
            last_name: lastName,
            first_name: firstName,
            phone_number: phoneNumber,
            address,
          };
        }
        return record;
      })
    );
  };

  const handleDeleteClick = (id: string) => {
    const record = records.find((record) => record.id === id);

    if (record) {
      setCurrentPersonnelUserId(record.id);

      setShowDeletePrompt(true);
    }
  };

  const handleDeleteEvent = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    await deletePersonnelUserRecord(currentPersonnelUserId);
    setRecords(
      records.filter((record) => record.id !== currentPersonnelUserId)
    );

    setShowDeletePrompt(false);
  };

  const [loading, setLoading] = useState(true);

  return (
    <>
      <div className="flex flex-col gap-10 h-full">
        {loading && <LoadingScreenSection />}

        {showInsertModal && (
          <div
            className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-auto`}>
            <div
              className={`rounded-2xl 
                bg-white text-black mx-3 md:w-[52rem]`}>
              <div className="flex justify-between items-center  py-3 px-5">
                {" "}
                <h2 className="text-xl font-semibold">Insert Personnel</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setNewEmail("");
                      setNewPassword("");
                      setShowPassword(false);
                      setNewLastName("");
                      setNewFirstName("");
                      setNewPhoneNumber("");
                      setNewAddress("");
                      setShowInsertModal(false);
                    }}
                    className="bg-red-600 flex text-lg rounded-xl px-3 py-1 text-white">
                    Cancel
                  </button>
                  <button
                    onClick={(event) => handleInsertEvent(event)}
                    disabled={
                      !newEmail ||
                      !newEmail.includes("@") ||
                      !newPassword ||
                      newPassword.length < 8 ||
                      !newLastName ||
                      !newFirstName ||
                      !newPhoneNumber ||
                      !newAddress
                    }
                    className={`flex text-lg rounded-xl px-3 py-1 text-white ${
                      !newEmail ||
                      !newEmail.includes("@") ||
                      !newPassword ||
                      newPassword.length < 8 ||
                      !newLastName ||
                      !newFirstName ||
                      !newPhoneNumber ||
                      !newAddress
                        ? "bg-gray-600"
                        : "bg-green-700"
                    }`}>
                    Insert
                  </button>
                </div>
              </div>
              <hr className="border border-green-700 w-full" />
              <div className="flex flex-col sm:flex-row p-5 gap-3 sm:gap-6 pb-6">
                <>
                  <div className="flex flex-col w-full gap-3">
                    <div>
                      <label htmlFor="newLastName">Last Name</label>
                      <input
                        type="text"
                        name="newLastName"
                        id="newLastName"
                        value={newLastName}
                        placeholder="Last Name"
                        onChange={(e) => setNewLastName(e.target.value)}
                        className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="newFirstName">First Name</label>
                      <input
                        type="text"
                        name="newFirstName"
                        id="newFirstName"
                        value={newFirstName}
                        placeholder="First Name"
                        onChange={(e) => setNewFirstName(e.target.value)}
                        className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPhoneNumber">Phone Number</label>
                      <input
                        type="text"
                        name="newPhoneNumber"
                        id="newPhoneNumber"
                        value={newPhoneNumber}
                        placeholder="09XX-XXX-XXXX"
                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                        className="input-style"
                      />
                    </div>
                    <div>
                      <label htmlFor="newAddress">Address</label>
                      <input
                        type="text"
                        name="newAddress"
                        id="newAddress"
                        value={newAddress}
                        placeholder="Address"
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="input-style"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col w-full gap-3">
                    <div>
                      <label htmlFor="newEmail">Email</label>
                      <input
                        type="email"
                        name="newEmail"
                        id="newEmail"
                        minLength={8}
                        value={newEmail}
                        placeholder="example@domain.com"
                        onChange={(e) => setNewEmail(e.target.value)}
                        className={`border focus:outline-none focus:z-10 rounded-lg p-2 w-full ${
                          newEmail && !newEmail.includes("@")
                            ? "border-red-600 focus:ring-red-500 focus:border-red-500"
                            : "border-green-700 focus:ring-green-500 focus:border-green-500"
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="newPassword"
                          id="newPassword"
                          value={newPassword}
                          placeholder="Password"
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (e.target.value && e.target.value.length < 8) {
                              setError(
                                "Password must be at least 8 characters"
                              );
                            } else {
                              setError("");
                            }
                          }}
                          className={`border focus:outline-none  focus:z-10 rounded-lg p-2 w-full ${
                            newPassword && newPassword.length < 8
                              ? "border-red-600 focus:ring-red-500 focus:border-red-500"
                              : "border-green-700 focus:ring-green-500 focus:border-green-500"
                          }}`}
                        />
                        <div
                          className="z-0 absolute text-gray-400 right-3 top-1/2 transform -translate-y-1/2 text-2xl"
                          onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <IoMdEye /> : <IoMdEyeOff />}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                </>
              </div>
            </div>
          </div>
        )}

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
                    // disabled={!location || !date || !time}
                    className={`flex text-lg rounded-xl px-3 py-1 bg-red-600 text-white 
                  `}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditPrompt && (
          <div
            className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-auto`}>
            <div
              className={`rounded-2xl 
                bg-white text-black mx-3 md:w-[52rem]`}>
              <div className="flex justify-between items-center  py-3 px-5">
                {" "}
                <h2 className="text-xl font-semibold">Update Personnel</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditPrompt(false)}
                    className="bg-red-600 flex text-lg rounded-xl px-3 py-1 text-white">
                    Cancel
                  </button>
                  <button
                    onClick={(event) => handleUpdateEvent(event)}
                    disabled={
                      !email ||
                      !email.includes("@") ||
                      !password ||
                      password.length < 8 ||
                      !lastName ||
                      !firstName ||
                      !phoneNumber ||
                      !address
                    }
                    className={`flex text-lg rounded-xl px-3 py-1 text-white ${
                      !email ||
                      !email.includes("@") ||
                      !password ||
                      password.length < 8 ||
                      !lastName ||
                      !firstName ||
                      !phoneNumber ||
                      !address
                        ? "bg-gray-600"
                        : "bg-green-700"
                    }`}>
                    Update
                  </button>
                </div>
              </div>
              <hr className="border border-green-700 w-full" />
              <div className="flex flex-col sm:flex-row p-5 gap-3 sm:gap-6 pb-6">
                <>
                  <div className="flex flex-col w-full gap-3">
                    <div>
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={lastName}
                        placeholder="Last Name"
                        onChange={(e) => setLastName(e.target.value)}
                        className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={firstName}
                        placeholder="First Name"
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="phoneNumber">Phone Number</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber"
                        value={phoneNumber}
                        placeholder="09XX-XXX-XXXX"
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="input-style"
                      />
                    </div>
                    <div>
                      <label htmlFor="address">Address</label>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={address}
                        placeholder="Address"
                        onChange={(e) => setAddress(e.target.value)}
                        className="input-style"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col w-full gap-3">
                    <div>
                      <label htmlFor="email">Email</label>
                      <input
                        type="text"
                        name="email"
                        id="email"
                        value={email}
                        minLength={8}
                        placeholder="example@domain.com"
                        onChange={(e) => setEmail(e.target.value)}
                        className={`border focus:outline-none  focus:z-10 rounded-lg p-2 w-full ${
                          email.includes("@")
                            ? "border-green-700 focus:ring-green-500 focus:border-green-500"
                            : "border-red-600 focus:ring-red-500 focus:border-red-500"
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor="password">Password</label>
                      <input
                        type="text"
                        name="password"
                        id="password"
                        value={password}
                        placeholder="Password"
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (e.target.value && e.target.value.length < 8) {
                            setError("Password must be at least 8 characters");
                          } else {
                            setError("");
                          }
                        }}
                        className={`border focus:outline-none  focus:z-10 rounded-lg p-2 w-full ${
                          password.length < 8
                            ? "border-red-600 focus:ring-red-500 focus:border-red-500"
                            : "border-green-700 focus:ring-green-500 focus:border-green-500"
                        }}`}
                      />
                    </div>
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                </>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center flex-col md:flex-row text-center">
          <h1 className="flex font-bold text-3xl text-green-700 mb-2">
            Personnel Management System
          </h1>
          <button
            type="submit"
            className="bg-green-700 flex text-lg rounded-xl px-5 py-2 text-white"
            onClick={() => setShowInsertModal(true)}>
            + Add Personnel
          </button>
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
                    <td
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap font-mono">
                      {record.id}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record.email}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record.password}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record.last_name}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record.first_name}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record.phone_number}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {record.address}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center justify-center gap-4 h-full">
                      <button
                        className="text-2xl hover:scale-125 transition delay-75 duration-300 ease-in-out hover:text-blue-600"
                        onClick={() => handleEditClick(record.id)}>
                        <MdOutlineEdit />
                      </button>
                      <button
                        className="text-2xl hover:scale-125 transition delay-75 duration-300 ease-in-out hover:text-red-600"
                        onClick={() => handleDeleteClick(record.id)}>
                        <MdOutlineDelete />
                      </button>
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
    </>
  );
};

export default Personnel;
