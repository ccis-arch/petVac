"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { fetchVaccineSchedule } from "@/data/vaccine_sched_data";
import { Scheduler } from "@aldabil/react-scheduler";
import { Event } from "@/types/interfaces";
import { locations } from "@/data/barangayData";
import { createPetOwnerUser } from "@/data/pet_owners_data";
import { insertAdminNotification } from "@/data/adminNotificationsData";
import { LoadingScreenFullScreen } from "./LoadingScreen";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Tabs, Tab, Card, CardBody, Button } from "@nextui-org/react";
import dynamic from "next/dynamic";
import { supabase } from "@/utils/supabase";
import Overview from "./admin/Overview";

const LeafletComponent = dynamic(() => import("./LeafletComponent"), {
  ssr: false,
});

const Landing = () => {
  const router = useRouter();
  const pathname = usePathname();

  const userType = pathname.includes("/admin") ? "admin" : "anon";

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  //Pet Owner Data
  const [ownerId, setOwnerId] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState("");
  const [ownerBirthDate, setOwnerBirthDate] = useState("");
  const [barangay, setBarangay] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isCheckedDataPrivacy, setIsCheckedDataPrivacy] =
    useState<boolean>(false);

  const fetchVaccineScheduleData = async () => {
    try {
      const response = await fetchVaccineSchedule(selectedLocation);
      if (response?.error) {
        console.error(response.error);
      } else {
        setEvents(response?.data || []);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    fetchVaccineScheduleData();
  }, [selectedLocation]);

  const handleClearForm = () => {
    setLastName("");
    setFirstName("");
    setGender("");
    setOwnerBirthDate("");
    setBarangay("");
    setPhoneNumber("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setError("");
  };

  const handleInsertEvent = async (event: any) => {
    setLoading(true);

    event.preventDefault();

    const newRecord = {
      email: email,
      password: password,
      last_name: lastName,
      first_name: firstName,
      phone_number: phoneNumber,
      gender: gender,
      barangay: barangay,
      birth_date: ownerBirthDate ? ownerBirthDate : null,
      date_registered: new Date(),
      // status: "active",
    };

    try {
      console.log("[v0] Submitting registration for:", email, "profile keys:", Object.keys(newRecord));
      const result = await createPetOwnerUser(email, password, newRecord);
      console.log("[v0] Registration result:", result);
      handleClearForm();
      setLoading(false);
      // router.push("/pet-owner/dashboard");
      alert("Successfully registered! Please login to continue.");
      router.push("/pet-owner/signin");
      // setShowSchedule(true);

      const newAdminNotif = {
        message: `A new pet owner with the email address ${email} has registered.`,
      };

      await insertAdminNotification(newAdminNotif);
    } catch (error: any) {
      setLoading(false);
      console.error("[v0] Failed to create user:", error);
      console.error("[v0] Error message:", error?.message);
      const errorMessage =
        error?.message || "An unexpected error occurred. Please try again.";
      alert("Failed to create user: " + errorMessage);
    }
  };

  return (
    <>
      {loading ? (
        <LoadingScreenFullScreen />
      ) : (
        <div className="h-full w-screen flex flex-col overflow-hidden">
          <div className="w-full flex flex-col sm:flex-row overflow-y-auto overflow-x-hidden">
            <div className="h-[100svh] z-10 bg-green-200 sm:w-[40%] relative">
              <Image
                src="/pet2.jpg"
                objectFit="cover"
                alt="Dog and Cat"
                layout="fill"
                priority
              />
              <div className=" w-full absolute py-10 h-full flex flex-col justify-between">
                <div
                  className="py-5 bg-green-700"
                  style={{ backgroundColor: "rgba(22, 163, 74, 0.4)" }}>
                  <div className="flex text-center self-center justify-center items-center gap-3">
                    <Image
                      src={"/pet-vax-logo-no-text.svg"}
                      width={80}
                      height={80}
                      alt="Logo"
                    />
                    <h1 className="flex flex-col text-white opacity-100 text-center font-bold text-xl md:text-4xl">
                      <span>Pet</span>
                      <span>Vaccination</span>
                      <span>System</span>
                    </h1>
                  </div>
                </div>
                <div className="px-[20%] md:mx-0 w-full flex flex-col md:flex-row justify-center gap-3">
                  <button
                    className="flex justify-center text-lg rounded-xl px-3 py-1 bg-green-700 text-white "
                    onClick={() => router.push("/admin/signin")}>
                    Login as Admin
                  </button>

                  <button
                    className="flex justify-center text-lg rounded-xl px-3 py-1 bg-green-700 text-white "
                    onClick={() => {
                      setLoading(true);
                      router.push("/pet-owner/signin");
                    }}>
                    Login as Pet Owner
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:gap-5 items-center justify-center absolute bottom-1 left-3 md:bottom-1 md:left-5">
                <Image
                  src="/bunawan_logo.svg"
                  width={100}
                  height={100}
                  alt="Bunawan Logo"
                  className="w-[50px] h-[50px] md:w-[100px] md:h-[100px]"
                />
                <Image
                  src="/agriculture_dept.svg"
                  width={100}
                  height={100}
                  alt="Bunawan Logo"
                  className="w-[50px] h-[50px] md:w-[100px] md:h-[100px]"
                />
              </div>

              <p className="text-white absolute bottom-1 right-5 text-[0.65rem]">
                Photo by{" "}
                <a
                  className="font-semibold"
                  href="  https://www.pexels.com/photo/grayscale-photo-of-dog-and-cat-together-11820257/">
                  Tehmasip Khan
                </a>
              </p>
            </div>
            <div className="min-h-[50vh] sm:max-h-[100vh] w-full sm:w-[60%] container mx-auto sm:mr-auto overflow-hidden overflow-x-hidden overflow-y-auto">
              <div className="h-full w-full py-2 px-2 flex flex-col justify-start items-start bg-[#F5F5F5] overflow-hidden">
                <div className="flex h-full w-full flex-col overflow-hidden">
                  <Tabs
                    key="Landing-Tabs"
                    color="success"
                    aria-label="Options"
                    size="lg"
                    variant="underlined">
                    <Tab key="schedule" title="Schedule" className="h-full">
                      <Card className="overflow-hidden h-full">
                        <CardBody className="overflow-y-hidden w-full flex flex-col">
                          <>
                            <div className="mt-5">
                              <h4 className="text-heading">
                                Current Vaccination Schedule
                              </h4>
                              <p className="text-subheading">
                                Check the latest vaccination schedule for your
                                pets!
                              </p>
                            </div>
                            <div className="mt-5 h-full">
                              <Scheduler
                                view="month"
                                // navigation={false}
                                disableViewNavigator={true}
                                editable={false}
                                deletable={false}
                                draggable={false}
                                events={events.map((event) => ({
                                  event_id: event.id,
                                  title: event.title,
                                  start: new Date(
                                    `${event.start_date}T${event.start_time}`
                                  ),
                                  end: new Date(
                                    `${event.end_date}T${event.end_time}`
                                  ),
                                  location: event.location,
                                  notes: event.note,
                                  allDay: event.allDay,
                                }))}
                                viewerExtraComponent={(fields, event) => {
                                  return (
                                    <div>
                                      {event.location && (
                                        <p>Location: {event.location}</p>
                                      )}
                                      {event.notes && (
                                        <p>Notes: {event.notes}</p>
                                      )}
                                    </div>
                                  );
                                }}
                              />
                            </div>
                          </>
                        </CardBody>
                      </Card>
                    </Tab>
                    <Tab
                      key="overview"
                      title="Overview"
                      className="h-full overflow-y-auto">
                      <Card className="overflow-hidden h-full">
                        <CardBody className="w-full flex flex-col">
                          <>
                            <div className="mt-5">
                              <h4 className="text-heading">Overview</h4>
                              <p className="text-subheading">
                                Explore a comprehensive overview of total
                                vaccinated pets, distributed vaccines, and
                                registered pet owners per barangay.
                              </p>
                            </div>
                            <div className="mt-5 h-full overflow-auto">
                              <Overview />
                            </div>
                          </>
                        </CardBody>
                      </Card>
                    </Tab>
                    <Tab
                      key="signup-pet-owner"
                      title="Sign-up as Pet Owner"
                      className="h-full w-full">
                      <Card className="overflow-hidden h-full">
                        <CardBody className="overflow-y-hidden w-full flex flex-col">
                          <>
                            <div className="mt-5">
                              <h4 className="text-heading">Register Now!</h4>
                              <p className="text-subheading">
                                Guarantee a secure and streamlined system for
                                registering all your furry friends. <br />
                                Start your pet registration journey today!
                              </p>
                            </div>

                            <div className="overflow-hidden mt-5">
                              <div className="flex flex-col gap-3">
                                <div>
                                  <label
                                    className="label-style"
                                    htmlFor="lastName">
                                    Last Name
                                  </label>
                                  <input
                                    type="text"
                                    name="lastName"
                                    id="lastName"
                                    value={lastName}
                                    placeholder="Last Name"
                                    onChange={(e) =>
                                      setLastName(e.target.value)
                                    }
                                    className="input-style"
                                  />
                                </div>
                                <div>
                                  <label
                                    className="label-style"
                                    htmlFor="firstName">
                                    First Name
                                  </label>
                                  <input
                                    type="text"
                                    name="firstName"
                                    id="firstName"
                                    value={firstName}
                                    placeholder="First Name"
                                    onChange={(e) =>
                                      setFirstName(e.target.value)
                                    }
                                    className="input-style"
                                  />
                                </div>
                                <div>
                                  <label
                                    className="label-style"
                                    htmlFor="gender">
                                    Gender
                                  </label>
                                  <select
                                    name="gender"
                                    id="gender"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="input-style">
                                    <option value=""> -- Select --</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="others">Others</option>
                                  </select>
                                </div>
                                <div>
                                  <label
                                    className="label-style"
                                    htmlFor="ownerBirthDate">
                                    Birthdate
                                  </label>
                                  <input
                                    type="date"
                                    name="ownerBirthDate"
                                    id="ownerBirthDate"
                                    value={ownerBirthDate}
                                    onChange={(e) =>
                                      setOwnerBirthDate(e.target.value)
                                    }
                                    className="input-style"
                                  />
                                </div>
                                <div>
                                  <label
                                    className="label-style"
                                    htmlFor="barangay">
                                    Barangay
                                  </label>
                                  <select
                                    name="barangay"
                                    id="barangay"
                                    value={barangay}
                                    onChange={(e) =>
                                      setBarangay(e.target.value)
                                    }
                                    className="input-style">
                                    <option value=""> -- Select --</option>
                                    {locations.map((location) => (
                                      <option key={location} value={location}>
                                        {location}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label
                                    className="label-style"
                                    htmlFor="phoneNumber">
                                    Phone Number
                                  </label>
                                  <input
                                    type="text"
                                    name="phoneNumber"
                                    id="phoneNumber"
                                    value={phoneNumber}
                                    placeholder="09XX-XXX-XXXX"
                                    onChange={(e) =>
                                      setPhoneNumber(e.target.value)
                                    }
                                    className="input-style"
                                  />
                                </div>
                                <div>
                                  <label
                                    className="label-style"
                                    htmlFor="email">
                                    Email
                                  </label>
                                  <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    minLength={8}
                                    value={email}
                                    placeholder="example@domain.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`input-style-with-condition ${
                                      email && !email.includes("@")
                                        ? "border-red-600 focus:ring-red-500 focus:border-red-500"
                                        : "border-green-700 focus:ring-green-500 focus:border-green-500"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <label
                                    className="label-style"
                                    htmlFor="password">
                                    Password
                                  </label>
                                  <div className="relative">
                                    <input
                                      type={showPassword ? "text" : "password"}
                                      name="password"
                                      id="password"
                                      value={password}
                                      placeholder="Password"
                                      onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (
                                          e.target.value &&
                                          e.target.value.length < 8
                                        ) {
                                          setError(
                                            "Password must be at least 8 characters"
                                          );
                                        } else {
                                          setError("");
                                        }
                                      }}
                                      className={`input-style-with-condition ${
                                        password && password.length < 8
                                          ? "border-red-600 focus:ring-red-500 focus:border-red-500"
                                          : "border-green-700 focus:ring-green-500 focus:border-green-500"
                                      }`}
                                    />
                                    <div
                                      className="z-0 absolute text-gray-400 right-3 top-1/2 transform -translate-y-1/2 text-2xl"
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }>
                                      {showPassword ? (
                                        <IoMdEye />
                                      ) : (
                                        <IoMdEyeOff />
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {/* <p className="text-xs text-red-600">{error}</p> */}
                                <div className="flex justify-center items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="dataPrivacy"
                                    name="dataPrivacy"
                                    checked={isCheckedDataPrivacy}
                                    onChange={() => {
                                      setIsCheckedDataPrivacy(
                                        !isCheckedDataPrivacy
                                      );
                                    }}
                                  />
                                  <label
                                    htmlFor="dataPrivacy"
                                    className="text-[0.7rem]">
                                    I accept the usage of my information in
                                    accordance with the Data Privacy Act of the
                                    Philippines.
                                  </label>
                                </div>

                                <div className="flex justify-between">
                                  <Button
                                    variant="light"
                                    onClick={handleClearForm}>
                                    <p className="text-sm underline hover:text-blue-600">
                                      Clear form input{" "}
                                    </p>
                                  </Button>
                                  <Button
                                    onClick={(event) =>
                                      handleInsertEvent(event)
                                    }
                                    color={
                                      !lastName ||
                                      !firstName ||
                                      !gender ||
                                      !barangay ||
                                      !phoneNumber ||
                                      !email ||
                                      !password ||
                                      !isCheckedDataPrivacy
                                        ? "default"
                                        : "success"
                                    }
                                    disabled={
                                      !lastName ||
                                      !firstName ||
                                      !gender ||
                                      !barangay ||
                                      !phoneNumber ||
                                      !email ||
                                      !password ||
                                      !isCheckedDataPrivacy
                                    }>
                                    Sign-up
                                  </Button>
                                </div>
                              </div>

                              {/* <div className="pt-5"> */}

                              {/* </div> */}
                            </div>
                          </>
                        </CardBody>
                      </Card>
                    </Tab>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Landing;
