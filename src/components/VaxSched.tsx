import { Scheduler } from "@aldabil/react-scheduler";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchVaccineSchedule,
  insertVaccineSchedule,
  updateVaccineSchedule,
  deleteVaccineSchedule,
} from "@/data/vaccine_sched_data";

import { IoShare } from "react-icons/io5";

import { Event } from "@/types/interfaces";
import { locations } from "@/data/barangayData";

import { useRouter, usePathname } from "next/navigation";

import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterShareButton,
  TwitterIcon,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
} from "react-share";

import { MdCopyAll } from "react-icons/md";
import copy from "copy-to-clipboard";
import { LoadingScreenSection } from "./LoadingScreen";

const VaxSched = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  const router = useRouter();
  const pathname = usePathname();

  const shareUrl = "https://pet-vaccination-system.vercel.app/";
  const title = "Pet Vaccination Scheduling";

  const userType = pathname.includes("/admin/")
    ? "admin"
    : pathname.includes("/personnel/")
    ? "personnel"
    : null;

  const fetchVaccineScheduleData = async () => {
    try {
      const response = await fetchVaccineSchedule(selectedLocation);
      if (response?.error) {
        console.error(response.error);
      } else {
        setEvents(response?.data || []);
        setLoading(false);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    fetchVaccineScheduleData();
  }, [selectedLocation]);

  const [showModal, setShowModal] = useState(false);

  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  // const [time, setTime] = useState("08:00");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");

  const [notes, setNotes] = useState("");

  const [showSharePrompt, setShowSharePrompt] = useState(false);

  // const [newInsertedEventCounter, setNewInsertedEventCounter] = useState(1);

  const [currentLocation, setCurrentLocation] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("08:00");
  const [currentNotes, setCurrentNotes] = useState("");

  const addEvent = async () => {
    const startDate = new Date(date + "T" + startTime);
    const endDate = new Date(date + "T" + endTime);
    // const endDate = new Date(startDate);
    // endDate.setHours(17, 0, 0, 0); // Set the time to 5:00 PM

    // console.log("maxId: ", maxId);
    const maxId = Math.max(...events.map((event) => event.id));
    const newId = Number.isFinite(maxId) ? maxId + 1 : 1;

    const newEvent: Event = {
      id: newId,
      // id: Number.isFinite(maxId) ? maxId + 1 : 1,
      title: location || "",
      start_date: startDate.toISOString().split("T")[0],
      start_time: startDate.toTimeString().split(" ")[0],
      end_date: endDate.toISOString().split("T")[0],
      end_time: endDate.toTimeString().split(" ")[0],
      location: location || "",
      note: notes || "",
      allDay: false,
    };

    const data = {
      id: newId,
      title: location || "",
      start_date: date,
      start_time: startTime,
      end_date: date,
      end_time: endTime,
      location: location || "",
      note: notes || "",
      allDay: false,
    };

    const response = await insertVaccineSchedule(data);
    if (response?.error) {
      console.error("Error inserting event:", response.error);
    } else {
      // console.log("response: ", response);

      setEvents([...events, newEvent]);
      setShowModal(false);
      // setNewInsertedEventCounter((prev) => prev + 1);
      setLocation("");
      setDate("");
      setStartTime("08:00");
      setEndTime("18:00");
      setNotes("");
    }
  };

  const [postMessage, setPostMessage] = useState("");

  useEffect(() => {
    const dateObject = new Date(currentDate);
    const timeObject = new Date(currentTime);

    const currentDate1 = new Date();
    const [hours, minutes, seconds] = currentTime.split(":");
    currentDate1.setHours(
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    );

    const formattedDate = dateObject.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = currentDate1.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    setPostMessage(
      `
      Attention Poblacion Pet Owners!
      
      There will be a pet vaccination drive happening on ${formattedDate} at ${formattedTime} in ${currentLocation}.
      
      This is your chance to get your furry friend vaccinated against rabies with the Rabisin vaccine.
      
      Don't miss out!
      
      #petvaccination 
      #pets 
      #health 
      #community`
    );
  }, [currentLocation, currentDate, currentTime, currentNotes]);

  // console.log("events: ", events);

  const [loading, setLoading] = useState(true);

  return (
    <div className="z-0 flex flex-col gap-10 h-full">
      {loading && <LoadingScreenSection />}

      {showSharePrompt && userType !== "admin" && (
        <div
          className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-auto`}>
          <div
            className={`rounded-2xl 
                bg-white text-black mx-3 md:w-[26rem]`}>
            <div className="flex justify-between items-center  py-3 px-5">
              {" "}
              <h2 className="text-xl font-semibold">Share</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSharePrompt(false)}
                  className="bg-red-600 flex text-lg rounded-xl px-3 py-1 text-white">
                  Close
                </button>
              </div>
            </div>
            <hr className="border border-green-700 w-full" />
            <div className="flex flex-col sm:flex-row p-5 gap-3 sm:gap-6 pb-6">
              <div className="flex flex-col w-full gap-3">
                <div className="flex justify-center items-center gap-5">
                  <FacebookShareButton
                    url={shareUrl}
                    className="Demo__some-network__share-button">
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>

                  <EmailShareButton
                    subject={"Pet Vaccination Schedule"}
                    body={postMessage}
                    url={shareUrl}
                    className="Demo__some-network__share-button">
                    <EmailIcon size={32} round />
                  </EmailShareButton>

                  <TwitterShareButton
                    url={shareUrl}
                    className="Demo__some-network__share-button">
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>

                  <TelegramShareButton url={shareUrl}>
                    <TelegramIcon size={32} round />
                  </TelegramShareButton>

                  {/* <FacebookMessengerShareButton
                    url={shareUrl}>
                    <FacebookMessengerIcon size={32} round />
                  </FacebookMessengerShareButton> */}
                </div>
                <div className="flex justify-between items-center">
                  <textarea
                    value={postMessage}
                    rows={5}
                    className="mt-5 p-2 w-full"
                    disabled
                  />

                  <MdCopyAll size={25} onClick={() => copy(postMessage)} />
                </div>
                {/* <div>
                  <p className="font-semibold">Location</p>
                  <p className="input-style">
                    {currentLocation}
                  </p>
                </div>
                <div>
                  <p>Date</p>
                  <p className="input-style">
                    {currentDate}
                  </p>
                </div>
                <div>
                  <p>Time</p>
                  <p className="input-style">
                    {currentTime}
                  </p>
                </div>
                <div>
                  <p>Notes</p>
                  <p className="input-style">
                    {currentNotes}
                  </p>
                </div>*/}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full flex justify-between items-center flex-col md:flex-row text-center">
        <h1
          className={`${
            userType === "admin" && "mb-2"
          } flex font-bold text-3xl text-green-700`}>
          Vaccination Schedule
        </h1>
        {userType === "admin" && (
          <button
            type="submit"
            className="bg-green-700 flex text-lg rounded-xl px-5 py-2 text-white"
            onClick={() => setShowModal(true)}>
            + New
          </button>
        )}
      </div>
      {showModal && (
        <div
          className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black`}>
          <div
            className={`rounded-2xl 
             bg-white text-black mx-3 md:w-[26rem]`}>
            <div className="flex justify-between items-center  py-3 px-5">
              <h2 className="text-xl font-semibold">Add Schedule</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-600 flex text-lg rounded-xl px-3 py-1 text-white">
                  Cancel
                </button>
                <button
                  onClick={addEvent}
                  disabled={!location || !date || !startTime || !endTime}
                  className={`flex text-lg rounded-xl px-3 py-1 text-white ${
                    !location || !date || !startTime || !endTime
                      ? "bg-gray-600"
                      : "bg-green-700"
                  }`}>
                  Save
                </button>
              </div>
            </div>
            <hr className=" border border-green-700 w-full" />
            <div className="flex flex-col w-full p-5 gap-3">
              <div>
                <label htmlFor="locationSelector">Location</label>
                <select
                  // ref={locationRef}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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
              </div>
              <div>
                <label htmlFor="dateSelector">Date</label>
                <input
                  // ref={dateRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  id="dateSelector"
                  className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                />
              </div>

              <div>
                <label htmlFor="startTime">Start Time</label>
                <input
                  // ref={timeRef}
                  type="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  id="startTime"
                  className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                />
              </div>
              <div>
                <label htmlFor="endTime">End Time</label>
                <input
                  // ref={timeRef}
                  type="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  id="endTime"
                  className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                />
              </div>

              <div>
                <label htmlFor="notesInput">Notes</label>
                <textarea
                  // ref={notesRef}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  name=""
                  id="notesInput"
                  cols={30}
                  rows={3}
                  className="input-style"></textarea>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="z-0 h-full w-full flex flex-col ">
        {userType === "admin" && (
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            name="selectedLocation"
            id="selectedLocation"
            className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 self-center rounded-lg py-1 ">
            <option value=""> -- All --</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        )}
        <Scheduler
          view="month"
          draggable={false}
          onConfirm={(event, action) => {
            return new Promise(async (resolve, reject) => {
              if (action === "edit") {
                // console.log("event: ", event);
                // console.log("Edited event event_id: ", event.event_id);

                // Prepare the updated event data
                const updatedSched = {
                  title: event.title,
                  start_date: event.start.toISOString().split("T")[0],
                  start_time: event.start.toTimeString().split(" ")[0],
                  end_date: event.end.toISOString().split("T")[0],
                  end_time: event.end.toTimeString().split(" ")[0],
                  location: event.location,
                  note: event.notes,
                  allDay: true,
                };

                let error;

                if (typeof event.event_id === "string") {
                  const eventId = Number(event.event_id);
                  if (Number.isNaN(eventId)) {
                    reject("Event id is not a number");
                    return;
                  }

                  error = await updateVaccineSchedule(eventId, updatedSched);
                } else if (typeof event.event_id === "number") {
                  error = await updateVaccineSchedule(
                    event.event_id,
                    updatedSched
                  );
                } else {
                  reject("Event id is not a string or a number");
                  return;
                }

                if (error) {
                  reject("Failed to update event: " + error);
                } else {
                  resolve(event);
                }
              }
            });
          }}
          editable={false}
          deletable={userType === "admin" ? true : false}
          onDelete={(id) => {
            return new Promise(async (resolve, reject) => {
              if (typeof id === "number") {
                try {
                  await deleteVaccineSchedule(id);
                  resolve(id);
                } catch (error) {
                  reject(error);
                }
              } else {
                reject("ID is not a number");
              }
            });
          }}
          events={
            userType === "admin"
              ? events.map((event) => ({
                  event_id: event.id,
                  title: event.title,
                  start: new Date(`${event.start_date}T${event.start_time}`),
                  end: new Date(`${event.end_date}T${event.end_time}`),
                  location: event.location,
                  notes: event.note,
                  allDay: event.allDay,
                  editable: true,
                }))
              : events.map((event) => ({
                  event_id: event.id,
                  title: event.title,
                  start: new Date(`${event.start_date}T${event.start_time}`),
                  end: new Date(`${event.end_date}T${event.end_time}`),
                  location: event.location,
                  notes: event.note,
                  allDay: event.allDay,
                }))
          }
          fields={[
            {
              name: "location",
              type: "select",
              options: locations.map((location) => ({
                id: location,
                text: location,
                value: location,
              })),
              config: {
                label: "Location",
                required: true,
                errMsg: "Select Location",
              },
            },
            {
              name: "notes",
              type: "input",
              // default: "Default Value...",
              config: { label: "Notes", multiline: true, rows: 3 },
            },
          ]}
          viewerExtraComponent={(fields, event) => {
            return <div>{event.notes && <p>Notes: {event.notes}</p>}</div>;
          }}
          viewerTitleComponent={(event) => {
            return (
              <div className="w-full flex justify-between items-center">
                <h2>{event.title}</h2>
                {userType !== "admin" && (
                  <button
                    className="flex text-2xl rounded-xl text-white"
                    onClick={() => {
                      setShowSharePrompt(true);
                      setCurrentLocation(event.location);
                      setCurrentDate(event.start.toISOString().split("T")[0]);
                      setCurrentTime(event.start.toTimeString().split(" ")[0]);
                      setCurrentNotes(event.notes);
                    }}>
                    <IoShare />
                  </button>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default VaxSched;
