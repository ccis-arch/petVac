"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { MdOutlineEdit } from "react-icons/md";
import { UserContext } from "@/utils/UserContext";
import { supabase } from "@/utils/supabase";

const Settings = () => {
  const [currentEmail, setCurrentEmail] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [toggleEditEmail, setToggleEditEmail] = useState(false);
  const { userName, userId } = useContext(UserContext);

  const memoizedFetchUserData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/user?userId=${userId}`);
      const result = await response.json();

      if (response.ok && result.user?.email) {
        setEmail(result.user.email);
        setCurrentEmail(result.user.email);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [userId]);

  useEffect(() => {
    memoizedFetchUserData();
  }, []);

  const handleEditEvent = async (editType: string) => {
    try {
      const updates = editType === "email" ? { email } : { password: newPassword };
      const response = await fetch("/api/admin/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, updates }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`Error updating user ${editType}:`, result.error);
        return;
      }

      if (editType === "email") {
        setToggleEditEmail(false);
        alert("Successfully updated user email");
        setCurrentEmail(email);
      } else {
        alert("Successfully updated user password");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (error) {
      console.error(`Error updating user ${editType}:`, error);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-10 h-full">
        <div className="flex justify-between items-center flex-col md:flex-row">
          <h1 className="flex font-bold text-3xl text-green-700 ">Settings</h1>
        </div>
        <div className="flex flex-col gap-5">
          {/* <div className="flex flex-col w-full gap-3">
            <div>
              <label htmlFor="newLastName">Last Name</label>
              <input
                type="text"
                name="newLastName"
                id="newLastName"
                // value={newLastName}
                placeholder="Last Name"
                // onChange={(e) => setNewLastName(e.target.value)}
                className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
              />
            </div>
          </div> */}
          <div
            className="flex flex-col gap-3 md:grid md:grid-cols-2 items-center pt-7 pb-20 sm:mx-40 lg:gap-x-96 sm:gap-y-6 overflow-y-auto"
            // style={{ gridTemplateColumns: "auto 1fr" }}
          >
            <label htmlFor="email" className="self-start">
              Email Address
            </label>
            <div className="w-full flex gap-2">
              <input
                type="text"
                name="email"
                id="email"
                value={toggleEditEmail ? email : currentEmail}
                disabled={!toggleEditEmail}
                placeholder="Email Address"
                onChange={(e) => setEmail(e.target.value)}
                className="input-style"
              />
              <button
                className={`${
                  toggleEditEmail ? "text-black" : "text-gray-600"
                } text-xs`}
                onClick={() => {
                  setToggleEditEmail(!toggleEditEmail);
                  setEmail(currentEmail);
                }}>
                {toggleEditEmail ? "Cancel" : "Edit"}
              </button>
            </div>
            <div className="w-full col-span-2 flex justify-end">
              <button
                onClick={() => handleEditEvent("email")}
                disabled={
                  !toggleEditEmail ||
                  email === currentEmail ||
                  email.length <= 8
                }
                className={`${
                  toggleEditEmail && email !== currentEmail && email.length >= 8
                    ? "bg-red-700"
                    : "bg-gray-700"
                } flex rounded-lg px-3 py-2 text-white`}>
                Change Email
              </button>
            </div>
            <label htmlFor="newPassword" className="self-start">
              New Password
            </label>
            <input
              type="text"
              name="newPassword"
              id="newPassword"
              value={newPassword}
              placeholder="New Password"
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-style"
            />
            <label htmlFor="confirmNewPassword" className="self-start">
              Confirm New Password
            </label>
            <input
              type="text"
              name="confirmNewPassword"
              id="confirmNewPassword"
              value={confirmNewPassword}
              placeholder="Confirm New Password"
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="input-style"
            />
            <div className="w-full col-span-2 flex justify-end">
              <button
                onClick={() => handleEditEvent("password")}
                disabled={email.length <= 8}
                className={`${
                  newPassword &&
                  confirmNewPassword &&
                  newPassword.length >= 8 &&
                  newPassword === confirmNewPassword
                    ? "bg-red-700"
                    : "bg-gray-700"
                } flex rounded-lg px-3 py-2 text-white`}>
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
