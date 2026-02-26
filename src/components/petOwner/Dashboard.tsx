"use client";
import { locations } from "@/data/barangayData";
import {
  deletePetRecord,
  editPetRecord,
  fetchPetRecordByOwnerID,
  insertPetRecord,
} from "@/data/pet_records_data";
import {
  fetchVaccineSchedule,
  fetchVaccineScheduleForAppointment,
} from "@/data/vaccine_sched_data";
import { UserContext } from "@/utils/UserContext";
import { supabase } from "@/utils/supabase";
import { Scheduler } from "@aldabil/react-scheduler";
import { differenceInMonths, differenceInYears, parseISO } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { CgProfile } from "react-icons/cg";
import {
  IoAlertCircle,
  IoLogOutOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import {
  MdOutlineAnnouncement,
  MdOutlineDelete,
  MdOutlineEdit,
  MdOutlineNotificationsNone,
  MdOutlineWarning,
} from "react-icons/md";
import Select from "react-select";
import { GrNext, GrPrevious } from "react-icons/gr";

import { editPetOwnerRecord, fetchPetOwnerById } from "@/data/pet_owners_data";
import {
  checkerBeforeInsertion,
  deleteAppointmentRecord,
  fetchAppointmentRecord,
  fetchAppointmentRecordByOwnerID,
  insertAppointmentRecord,
} from "@/data/appointmentData";
import { insertAdminNotification } from "@/data/adminNotificationsData";
import { fetchVaccinationRecordsByOwnerID } from "@/data/vaccinationRecordsData";

import { LoadingScreenSection } from "../LoadingScreen";
import {
  Avatar,
  Badge,
  Button,
  Calendar,
  Select as NextSelect,
  SelectItem,
} from "@nextui-org/react";
import {
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardBody,
  Image as NextImage,
} from "@nextui-org/react";

const PetOwnerDashboard = () => {
  //Pet Data
  const [petId, setPetId] = useState("");
  const [dateVaccinated, setDateVaccinated] = useState("");
  const [petName, setPetName] = useState("");
  const [specie, setSpecie] = useState<"cat" | "dog" | undefined | "">();
  const [sex, setSex] = useState("");
  const [breed, setBreed] = useState("");
  const [petBirthDate, setPetBirthDate] = useState("");
  const [weight, setWeight] = useState("");
  const [animalColor, setAnimalColor] = useState("");
  const [petOrigin, setPetOrigin] = useState("");
  const [petOriginOthersOption, setPetOriginOthersOption] = useState("");
  const [ownership, setOwnership] = useState("");
  const [habitat, setHabitat] = useState("");
  const [tag, setTag] = useState("");
  const [tagOthersOption, setTagOthersOption] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);
  const [isLactating, setIsLactating] = useState(false);
  const [numPups, setNumPups] = useState(0);
  const [petOwner, setPetOwner] = useState("");

  // const [petId, setPetId] = useState("");
  const [newPetName, setNewPetName] = useState("");
  const [newDateVaccinated, setNewDateVaccinated] = useState("");
  const [newSpecie, setNewSpecie] = useState<"cat" | "dog" | undefined | "">();
  const [newSex, setNewSex] = useState("");
  const [newBreed, setNewBreed] = useState("");
  const [newPetBirthDate, setNewPetBirthDate] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [newAnimalColor, setNewAnimalColor] = useState("");
  const [newPetOrigin, setNewPetOrigin] = useState("");
  const [newPetOriginOthersOption, setNewPetOriginOthersOption] = useState("");
  const [newOwnership, setNewOwnership] = useState("");
  const [newHabitat, setNewHabitat] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newTagOtherOption, setNewTagOtherOption] = useState("");
  const [newIsPregnant, setNewIsPregnant] = useState(false);
  const [newIsLactating, setNewIsLactating] = useState(false);
  const [newNumPups, setNewNumPups] = useState(0);
  const [newPetOwner, setNewPetOwner] = useState("");

  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { userName, userId, userLocation } = useContext(UserContext);

  const [events, setEvents] = useState<any[]>([]);
  const [showInsertModal, setShowInsertModal] = useState(false);

  const [records, setRecords] = useState<any[]>([]);

  const [locationSelector, setLocationSelector] = useState("");
  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  const [showSettingsChange, setShowSettingsChange] = useState(false);

  const [showProcessModal, setShowProcessModal] = useState(false);
  const [currentProcessDisplay, setCurrentProcessDisplay] = useState(1);

  const locationItems = [
    { value: "", label: "All" },
    ...locations.map((location) => ({ value: location, label: location })),
  ];

  useEffect(() => {});

  const fetchVaccineScheduleData = async () => {
    try {
      const response = await fetchVaccineSchedule(locationSelector);
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

    const channel = supabase
      .channel(`realtime schedule sessions`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "VaccinationSchedule",
        },
        (payload) => {
          if (payload.new) {
            setEvents((prevRecord: any) => [payload.new as any, ...prevRecord]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "VaccinationSchedule",
        },
        (payload) => {
          if (payload.new) {
            setEvents((prevRecord: any) =>
              prevRecord.map((record: any) =>
                record.id === payload.new.id ? payload.new : record
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "VaccinationSchedule",
        },
        (payload) => {
          if (payload.old) {
            setEvents((prevRecord: any) =>
              prevRecord.filter((record: any) => record.id !== payload.old.id)
            );
          }
          // console.log("payloard:", payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [locationSelector]);

  const generateNotification = (record: any) => {
    const dateVaccinated = new Date(record.date_vaccinated);
    const currentDate = new Date();
    const nextVaccinationDate = new Date(
      dateVaccinated.setFullYear(dateVaccinated.getFullYear() + 1)
    );
    const diffTime = nextVaccinationDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let message = "";

    if (diffDays <= 90) {
      if (diffDays <= 0) {
        message = `${record.pet_name} needs to be vaccinated`;
      } else if (diffDays <= 7) {
        message = `Vaccination for ${record.pet_name} due in ${diffDays} day(s)`;
      } else if (diffDays <= 30) {
        message = `Vaccination for ${record.pet_name} due in 1 month`;
      } else if (diffDays <= 60) {
        message = `Vaccination for ${record.pet_name} due in 2 months`;
      } else {
        message = `Vaccination for ${record.pet_name} due in ${diffDays} days`;
      }
    }

    return {
      ...record,
      message,
      submessage:
        `${record.pet_name} is a ${record.sex} ${record.breed} ${record.specie}`.replace(
          /\b\w/g,
          function (char) {
            return char.toUpperCase();
          }
        ),
    };
  };

  const updateVaccinationDate = async (record: any) => {
    const { PetOwnerProfiles, ...recordWithoutPetOwnerProfiles } = record;
    const dateVaccinated = new Date(record.date_vaccinated);
    const today = new Date();
    if (
      dateVaccinated.getFullYear() < today.getFullYear() ||
      (dateVaccinated.getFullYear() === today.getFullYear() &&
        dateVaccinated.getMonth() < today.getMonth()) ||
      (dateVaccinated.getFullYear() === today.getFullYear() &&
        dateVaccinated.getMonth() === today.getMonth() &&
        dateVaccinated.getDate() < today.getDate())
    ) {
      record.date_vaccinated = null;
      const updatedRecord = {
        ...recordWithoutPetOwnerProfiles,
        date_vaccinated: null,
      };
      await editPetRecord(record.id, updatedRecord);
    }
    return record;
  };

  const fetchPetRecordByOwnerIDData = async () => {
    if (userId) {
      try {
        const data = await fetchPetRecordByOwnerID(userId);
        setRecords(data || []);

        // Generate notifications for each pet record
        if (data && data.length > 0) {
          const notifs = data.map((record: any) => generateNotification(record));
          setNotifications(notifs);
          // update date_vaccinated of pet if past due
          data.map(updateVaccinationDate);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  };

  useEffect(() => {
    fetchPetRecordByOwnerIDData();
    const channel = supabase
      .channel(`realtime pet record sessions`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "PetRecords",
        },
        async (payload) => {
          if (payload.new && payload.new.owner_id === userId) {
            const newRecord = generateNotification(payload.new);
            setRecords((prevRecord) => [...prevRecord, newRecord]);
            setNotifications((prevNotifications) => [
              ...(Array.isArray(prevNotifications) ? prevNotifications : []),
              newRecord,
            ]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "PetRecords",
        },
        (payload) => {
          if (payload.new && payload.new.owner_id === userId) {
            // setRecords((prevRecord: any) =>
            //   prevRecord.map((record: any) =>
            //     record.id === payload.new.id ? payload.new : record
            //   )
            // );
            const newRecord = generateNotification(payload.new);
            setRecords((prevRecord: any) =>
              prevRecord.map((record: any) =>
                record.id === newRecord.id ? newRecord : record
              )
            );
            setNotifications((prevNotifications: any) => {
              if (Array.isArray(prevNotifications)) {
                const existingNotificationIndex = prevNotifications.findIndex(
                  (notification: any) => notification.id === newRecord.id
                );

                if (existingNotificationIndex !== -1) {
                  // Update existing notification
                  return prevNotifications.map((notification: any) =>
                    notification.id === newRecord.id
                      ? generateNotification(newRecord)
                      : notification
                  );
                } else {
                  // Add new notification
                  return [
                    ...prevNotifications,
                    generateNotification(newRecord),
                  ];
                }
              } else {
                // Initialize notifications with new record
                return [generateNotification(newRecord)];
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleInsertEvent = async (event: any) => {
    event.preventDefault();
    setLoading(true);

    const newPet = {
      pet_name: newPetName,
      specie: newSpecie,
      sex: newSex,
      breed: newBreed,
      birth_date: newPetBirthDate,
      weight: parseInt(newWeight),
      color: newAnimalColor,
      pet_origin:
        newPetOrigin === "others" ? newPetOriginOthersOption : newPetOrigin,
      ownership: newOwnership,
      habitat: newHabitat,
      tag: newTag === "others" ? newTagOtherOption : newTag,
      is_pregnant: newSex === "male" ? null : newIsPregnant,
      is_lactating_with_puppies: newSex === "male" ? null : newIsLactating,
      num_puppies: newSex === "male" ? null : newNumPups,

      owner_id: userId,
    };
    const response = await insertPetRecord(newPet);

    if (response?.error) {
      console.error("Error inserting new pet:", response.error);
    } else {
      setShowInsertModal(false);

      setNewPetName("");
      setNewSpecie("");
      setNewSex("");
      setNewBreed("");
      setNewPetBirthDate("");
      setNewWeight("");
      setNewAnimalColor("");
      setNewPetOrigin("");
      setNewPetOriginOthersOption("");
      setNewOwnership("");
      setNewHabitat("");
      setNewTag("");
      setNewTagOtherOption("");
      setNewIsPregnant(false);
      setNewIsLactating(false);
      setNewNumPups(0);
      // setNewDateVaccinated("");

      const newAdminNotif = {
        message: `${userName} added a new pet.`,
      };

      await insertAdminNotification(newAdminNotif);
    }
    setLoading(false);
  };

  const dropdownRefMenu = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRefMenu.current &&
        !dropdownRefMenu.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const breeds = {
    cat: [
      "Abyssinian",
      "Bengal",
      "British Shorthair",
      "Maine Coon",
      "Persian",
      "Puspin",
      "Ragdoll",
      "Russian Blue",
      "Scottish Fold",
      "Siamese",
      "Sphynx",
    ],
    dog: [
      "Aspin",
      "Beagle",
      "Boxer",
      "Bulldog",
      "Dachshund",
      "Doberman Pinscher",
      "German Shepherd",
      "Golden Retriever",
      "Great Dane",
      "Labrador Retriever",
      "Poodle",
      "Shih Tzu",
      "Siberian Husky",
    ],
  };

  const [breedOptions, setBreedOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    if (newSpecie) {
      setBreedOptions(
        breeds[newSpecie].map((breed: string) => ({
          value: breed,
          label: breed,
        }))
      );
    } else {
      setBreedOptions([]);
    }
  }, [newSpecie]);

  useEffect(() => {
    if (specie) {
      setBreedOptions(
        breeds[specie].map((breed: string) => ({
          value: breed,
          label: breed,
        }))
      );
    } else {
      setBreedOptions([]);
    }
  }, [specie]);

  const handleEditClick = (id: string) => {
    setLoading(true);

    const record = records.find((record) => record.id === id);

    if (record) {
      setPetId(record.id);
      setDateVaccinated(record.date_vaccinated);
      setPetName(record.pet_name);
      setSpecie(record.specie);
      setSex(record.sex);
      setBreed(record.breed);
      setPetBirthDate(record.birth_date);
      setWeight(record.weight);
      setAnimalColor(record.color);

      if (record.pet_origin !== "local") {
        setPetOrigin("others");
        setPetOriginOthersOption(record.pet_origin);
      } else {
        setPetOrigin(record.pet_origin);
        setPetOriginOthersOption("");
      }
      setOwnership(record.ownership);
      setHabitat(record.habitat);

      if (
        record.tag !== "collar-tag" ||
        record.tag !== "microchip" ||
        record.tag !== "tattoo-code"
      ) {
        setTag("others");
        setTagOthersOption(record.tag);
      } else {
        setTag(record.tag);
        setTagOthersOption("");
      }
      if (record.sex === "female") {
        setIsPregnant(record.is_pregnant);
        setIsLactating(record.is_lactating_with_puppies);
        setNumPups(record.num_puppies);
      }

      setShowEditPrompt(true);
      setLoading(false);
    }
  };

  const handleEditEvent = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setLoading(true);

    // console.log("isPregnant", isPregnant);

    const updatedRecord = {
      pet_name: petName,
      specie: specie,
      sex: sex,
      breed: breed,
      birth_date: petBirthDate,
      weight: Number(weight),
      color: animalColor,
      // date_vaccinated: new Date(dateVaccinated),
      pet_origin: petOrigin === "others" ? petOriginOthersOption : petOrigin,
      ownership: ownership,
      habitat: habitat,
      tag: tag === "others" ? tagOthersOption : tag,
      is_pregnant: sex === "male" ? null : isPregnant,
      is_lactating_with_puppies: sex === "male" ? null : isLactating,
      num_puppies: sex === "male" ? null : numPups,
    };

    await editPetRecord(petId, updatedRecord);

    setShowEditPrompt(false);
    setLoading(false);
  };

  const handleDeleteClick = (id: string) => {
    const record = records.find((record) => record.id === id);

    if (record) {
      setPetId(record.id);

      setShowDeletePrompt(true);
    }
  };

  const handleDeleteEvent = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setLoading(true);

    await deletePetRecord(petId);

    // // it is also to remove the data of pet as vaccinated in distributed vaccine records
    // const deletedPetIsVaccinated = await checkIfVaccinationRecordHavePetID(
    //   petId
    // );

    // if (deletedPetIsVaccinated && deletedPetIsVaccinated.length > 0) {
    //   const checkIfVaccineIsInRecords =
    //     await checkIfDistributedVaccinatHaveInvetoryIdOfVaccinatedPet(
    //       deletedPetIsVaccinated[0]?.vaccine_id
    //     );

    //   if (checkIfVaccineIsInRecords && checkIfVaccineIsInRecords.length > 0) {
    //     await updateDistributedVaccineWithInventoryID(
    //       deletedPetIsVaccinated[0]?.vaccine_id,
    //       { num_vaccines: checkIfVaccineIsInRecords[0]?.num_vaccines - 1 }
    //     );

    //     const vaccineInventoryRecord = await checkVaccineIdInVaccineInventory(
    //       deletedPetIsVaccinated[0]?.vaccine_id
    //     );

    //     if (vaccineInventoryRecord && vaccineInventoryRecord.length > 0) {
    //       await updateVaccineInventoryWithInventoryID(
    //         deletedPetIsVaccinated[0]?.vaccine_id,
    //         { remaining_qty: vaccineInventoryRecord[0]?.remaining_qty + 1 }
    //       );
    //     }
    //   }
    // }

    setRecords(records.filter((record) => record.id !== petId));

    setShowDeletePrompt(false);
    setLoading(false);
  };

  const [currentEmail, setCurrentEmail] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [toggleEditEmail, setToggleEditEmail] = useState(false);

  const [loading, setLoading] = useState(false);

  const memoizedFetchUserEmailData = useCallback(async () => {
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
    memoizedFetchUserEmailData();
  }, [userId]);

  const handleEditInfoEvent = async (editType: string) => {
    setLoading(true);

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
        setLoading(false);
        return;
      }

      if (editType === "email") {
        setToggleEditEmail(false);
        const { error } = await supabase
          .from("PetOwnerProfiles")
          .update({ email: email })
          .eq("id", userId);
        if (error) {
          // Revert auth email if profile update fails
          await fetch("/api/admin/user", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, updates: { email: currentEmail } }),
          });
          setLoading(false);
          return;
        }
        setLoading(false);
        alert("Successfully updated user email");
        setCurrentEmail(email);
      } else {
        const { error } = await supabase
          .from("PetOwnerProfiles")
          .update({ password: newPassword })
          .eq("id", userId);
        if (error) {
          setLoading(false);
          return;
        }
        setLoading(false);
        alert("Successfully updated user password");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (error) {
      console.error(`Error updating user:`, error);
      setLoading(false);
    }
  };

  const [initialFirstName, setInitialFirstName] = useState("");
  const [initialLastName, setInitialLastName] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");

  const memoizedFetchUserNameData = useCallback(async () => {
    try {
      const response = await fetchPetOwnerById(userId);
      if (response && response.length > 0) {
        setNewFirstName(response[0]?.first_name);
        setNewLastName(response[0]?.last_name);
        setInitialFirstName(response[0]?.first_name);
        setInitialLastName(response[0]?.last_name);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [userId]);

  useEffect(() => {
    memoizedFetchUserNameData();
  }, [userId]);

  const handleEditNameInfoEvent = async () => {
    setLoading(true);

    const updatedRecord = {
      first_name: newFirstName,
      last_name: newLastName,
    };

    const response = await editPetOwnerRecord(userId, updatedRecord);

    setLoading(false);
    if (response.error) {
      console.error("Error updating user:", response.error);
    } else {
      alert("Successfully updated user name");

      setInitialFirstName(newFirstName);
      setInitialLastName(newLastName);
    }
  };

  const [toggleAppointment, setToggleAppointment] = useState(false);
  const [showInsertAppointmentModal, setShowInsertAppointmentModal] =
    useState(false);

  const [appointments, setAppointments] = useState<
    { value: any; label: string; start_time: string; end_time: string }[]
  >([]);
  const [timeSlots, setTimeSlots] = useState<
    { time: string; remainingSlots: number }[]
  >([]);

  const generateTimeSlots = async (selectedOption: any) => {
    const startTime = new Date(`1970-01-01T${selectedOption.start_time}Z`);
    const endTime = new Date(`1970-01-01T${selectedOption.end_time}Z`);
    const interval = 45; // minutes

    let timeSlots: { time: string; remainingSlots: number }[] = [];
    while (startTime <= endTime) {
      const hours = startTime.getUTCHours().toString().padStart(2, "0");
      const minutes = startTime.getUTCMinutes().toString().padStart(2, "0");
      const time = `${hours}:${minutes}`;

      const response = await fetchAppointmentRecord(selectedOption.value, time);
      const bookedSlots = response ? response.data.length : 0;
      const remainingSlots = 10 - bookedSlots;

      if (remainingSlots > 0) {
        timeSlots.push({ time, remainingSlots });
      }

      startTime.setUTCMinutes(startTime.getUTCMinutes() + interval);
    }

    setTimeSlots(timeSlots);
    if (timeSlots.length > 0) {
      setSelectedTime(timeSlots[0]?.time);
    } else {
      setSelectedTime(undefined);
    }
  };

  useEffect(() => {
    const fetchOperators = async () => {
      const response = await fetchVaccineScheduleForAppointment("");
      if (response && response.data) {
        setAppointments(
          response.data.map((appointment) => {
            const startDate = new Date(appointment.start_date);
            const formattedDate = startDate.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            const startTime = new Date(`1970-01-01T${appointment.start_time}Z`);
            const formattedStartTime = startTime.toISOString().substr(11, 5);

            const endTime = new Date(`1970-01-01T${appointment.end_time}Z`);
            const formattedEndTime = endTime.toISOString().substr(11, 5);

            const label = `${appointment.location}: ${formattedDate} (${formattedStartTime} - ${formattedEndTime})`;

            return {
              value: appointment.id,
              label: label,
              start_time: appointment.start_time,
              end_time: appointment.end_time,
            };
          })
        );
      }
    };

    fetchOperators();
  }, []);

  const [selectedAppointment, setSelectedAppointment] = useState<
    | {
        value: any;
        label: string;
      }
    | undefined
  >(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined
  );

  const [selectedPets, setSelectedPets] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleNewAppointment = async (event: any) => {
    event.preventDefault();

    setIsSubmitting(true);

    if (!selectedTime) return;

    const paddedValue =
      selectedAppointment?.value?.toString().padStart(4, "0") || "";
    const [hours, minutes] = selectedTime.split(":");
    const paddedHours = hours.padStart(2, "0");
    const paddedMinutes = minutes.padStart(2, "0");

    // Get current date and time
    const now = new Date();
    const year = now.getFullYear().toString().slice(2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hour = now.getHours().toString().padStart(2, "0");
    const minute = now.getMinutes().toString().padStart(2, "0");
    const second = now.getSeconds().toString().padStart(2, "0");

    const newAppointments = selectedPets.map((petId) => ({
      owner_id: userId,
      pet_id: petId,
      ticket_num: `${paddedValue}-${paddedHours}${paddedMinutes}-${year}${month}-${day}${hour}-${minute}${second}`,
      vaccine_sched_id: selectedAppointment?.value,
      time: selectedTime,
    }));

    const existingAppointments = await Promise.all(
      newAppointments.map((appointment) =>
        checkerBeforeInsertion(
          appointment.owner_id,
          appointment.pet_id,
          appointment.vaccine_sched_id
        )
      )
    );

    if (
      existingAppointments.some(
        (appointment) => appointment && appointment.data.length > 0
      )
    ) {
      alert(
        "You already had an appointment on the selected vaccination schedule."
      );
      return;
    }

    const responses = await Promise.all(
      newAppointments.map((appointment) => insertAppointmentRecord(appointment))
    );

    responses.forEach((response, index) => {
      if (response?.error) {
        console.error(
          `Error inserting new appointment for pet ${newAppointments[index].pet_id}:`,
          response.error
        );
      }
    });

    // Assuming you want to reset the state after all appointments have been processed
    setShowInsertAppointmentModal(false);
    setSelectedTime("");
    setTimeSlots([]);
    setSelectedPets([]);
    setSelectedAppointment(undefined);
  };

  const [appointmentRecords, setAppointmentRecords] = useState<any[]>([]);

  const fetchAppointmentRecordByOwnerIDData = async () => {
    let data: any[] | null = null;
    if (userId) {
      try {
        const result = await fetchAppointmentRecordByOwnerID(userId);
        data = result || null;
        setAppointmentRecords(data || []);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
    return data;
  };

  useEffect(() => {
    fetchAppointmentRecordByOwnerIDData();

    const channel = supabase
      .channel(`realtime apppointment owner sessions`)

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "AppointmentRecords",
        },
        async (payload: { new?: any }) => {
          if (payload.new) {
            const updatedData = await fetchAppointmentRecordByOwnerIDData();
            setAppointmentRecords(updatedData || []);
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
        async (payload: { old?: any }) => {
          if (payload.old) {
            const updatedData = await fetchAppointmentRecordByOwnerIDData();
            setAppointmentRecords(updatedData || []);
          }
        }
      )
      .subscribe();

    return () => {
      // Remove the channel subscription when component unmounts
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const [appointmentId, setAppointmentId] = useState("");
  const [showAppointmentDeletePrompt, setShowAppointmentDeletePrompt] =
    useState(false);

  const handleAppointmentDeleteClick = (id: string) => {
    const record = appointmentRecords.find((record) => record.id === id);

    if (record) {
      setAppointmentId(record.id);
      setShowAppointmentDeletePrompt(true);
    }
  };

  const handleAppointmentDeleteEvent = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setLoading(true);

    await deleteAppointmentRecord(appointmentId);
    // setAppointmentRecords(
    //   appointmentRecords.filter((record) => record.id !== appointmentId)
    // );

    setShowAppointmentDeletePrompt(false);
    setLoading(false);
    alert("Appointment deleted successfully");
  };

  const [historyRecords, setHistoryRecords] = useState<any[]>([]);

  const fetchHistoryVaccinationRecords = async () => {
    if (userId) {
      try {
        const data = await fetchVaccinationRecordsByOwnerID(userId);
        setHistoryRecords(data || []);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  };

  useEffect(() => {
    fetchHistoryVaccinationRecords();

    const channel = supabase
      .channel(`realtime vaccinated pets by user`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ViewCompleteVaccinationDetails",
        },
        (payload) => {
          if (payload.new) {
            setHistoryRecords((prevRecord: any) => [
              payload.new as any,
              ...prevRecord,
            ]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ViewCompleteVaccinationDetails",
        },
        (payload) => {
          if (payload.new) {
            setHistoryRecords((prevRecord: any) =>
              prevRecord.map((record: any) =>
                record.id === payload.new.id ? payload.new : record
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "ViewCompleteVaccinationDetails",
        },
        (payload) => {
          if (payload.old) {
            setHistoryRecords((prevRecord: any) =>
              prevRecord.filter((record: any) => record.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

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

  useEffect(() => {
    if (notifications && notifications.length > 0)
      setIsNotificationClicked(true);
  }, [notifications]);

  const [isNotificationClicked, setIsNotificationClicked] = useState(false);

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 6,
      slidesToSlide: 6,
    },
    tablet: {
      breakpoint: { max: 1024, min: 768 },
      items: 5,
      slidesToSlide: 5,
    },
    mobile: {
      breakpoint: { max: 767, min: 464 },
      items: 4,
      slidesToSlide: 4,
    },
  };

  const images = [
    "appointment.png",
    "share.png",
    "remote-working.png",
    "vaccinated.png",
    "vaccination.png",
  ];
  const texts = [
    "1. Schedule appointment online",
    "2. Receive ticket",
    "3. Wait remotely for the set schedule",
    "4. Service is provided to customer",
    "5. View vaccination history",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="flex w-screen justify-center overflow-x-hidden h-[100svh] bg-gray-200 sm:overflow-y-hidden">
      {loading && <LoadingScreenSection />}
      <div className="rounded-3xl bg-white shadow-lg py-6 px-6 w-full m-5 font-Montserrat">
        <div className="flex flex-col gap-10 h-full">
          {showSettingsChange && (
            <div
              className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-hidden`}
            >
              <div
                className={`rounded-2xl 
             bg-white text-black mx-3 md:w-[40rem]`}
              >
                <div className="flex justify-between items-center  py-3 px-5">
                  {" "}
                  <h2 className="text-xl font-semibold">
                    Update Personal Info
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowSettingsChange(false);
                        setEmail(currentEmail);
                        setToggleEditEmail(false);
                        setNewFirstName(initialFirstName);
                        setNewLastName(initialLastName);
                      }}
                      className="bg-purple-700 flex text-lg rounded-xl px-3 py-1 text-white"
                    >
                      OK
                    </button>
                  </div>
                </div>
                <hr className="border border-green-700 w-full" />
                <div className="flex flex-col sm:flex-row p-5 gap-3 sm:gap-6 pb-6">
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 items-center pt-7 gap-y-6 gap-x-10 overflow-y-auto">
                    <label htmlFor="email">Email Address</label>
                    <div className="flex gap-2">
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
                        }}
                      >
                        {toggleEditEmail ? "Cancel" : "Edit"}
                      </button>
                    </div>
                    <div className="w-full col-span-2 flex justify-end">
                      <button
                        onClick={() => handleEditInfoEvent("email")}
                        disabled={
                          !toggleEditEmail ||
                          email === currentEmail ||
                          email.length <= 8
                        }
                        className={`${
                          toggleEditEmail &&
                          email !== currentEmail &&
                          email.length >= 8
                            ? "bg-red-700"
                            : "bg-gray-700"
                        } flex rounded-lg px-3 py-2 text-white`}
                      >
                        Change Email
                      </button>
                    </div>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="text"
                      name="newPassword"
                      id="newPassword"
                      value={newPassword}
                      placeholder="New Password"
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-style"
                    />
                    <label htmlFor="confirmNewPassword">
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
                        onClick={() => handleEditInfoEvent("password")}
                        disabled={email.length <= 8}
                        className={`${
                          newPassword &&
                          confirmNewPassword &&
                          newPassword.length >= 8 &&
                          newPassword === confirmNewPassword
                            ? "bg-red-700"
                            : "bg-gray-700"
                        } flex rounded-lg px-3 py-2 text-white`}
                      >
                        Change Password
                      </button>
                    </div>
                    <label htmlFor="newFirstName">First Name</label>
                    <input
                      type="text"
                      name="newFirstName"
                      id="newFirstName"
                      value={newFirstName}
                      placeholder="First Name"
                      onChange={(e) => setNewFirstName(e.target.value)}
                      className="input-style"
                    />
                    <label htmlFor="newLastName">Last Name</label>
                    <input
                      type="text"
                      name="newLastName"
                      id="newLastName"
                      value={newLastName}
                      placeholder="Last Name"
                      onChange={(e) => setNewLastName(e.target.value)}
                      className="input-style"
                    />
                    <div className="w-full col-span-2 flex justify-end">
                      <button
                        onClick={() => handleEditNameInfoEvent()}
                        disabled={
                          newFirstName.length < 3 || newLastName.length < 3
                          // newFirstName === initialFirstName ||
                          // newLastName === initialLastName
                        }
                        className={`${
                          newFirstName &&
                          newLastName &&
                          newFirstName.length > 2 &&
                          newLastName.length > 2 &&
                          (newFirstName !== initialFirstName ||
                            newLastName !== initialLastName)
                            ? "bg-red-700"
                            : "bg-gray-700"
                        } flex rounded-lg px-3 py-2 text-white`}
                      >
                        Change Name
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showDeletePrompt && (
            <div
              className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black`}
            >
              <div
                className={`rounded-2xl bg-white text-black mx-3 md:w-[26rem]`}
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
              className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-hidden`}
            >
              <div
                className={`rounded-2xl 
              bg-white text-black mx-3 md:w-[52rem]`}
              >
                <div className="flex justify-between items-center  py-3 px-5">
                  {" "}
                  <h2 className="text-xl font-semibold">Update Pet</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowEditPrompt(false);
                      }}
                      className="bg-red-600 flex text-lg rounded-xl px-3 py-1 text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(event) => handleEditEvent(event)}
                      disabled={
                        !petName ||
                        !specie ||
                        !sex ||
                        !breed ||
                        !petBirthDate ||
                        !weight ||
                        !animalColor ||
                        !petOrigin ||
                        (petOrigin === "others" && !petOriginOthersOption) ||
                        !ownership ||
                        !habitat ||
                        !tag ||
                        (tag === "others" && !tagOthersOption)
                      }
                      className={`flex text-lg rounded-xl px-3 py-1 text-white ${
                        !petName ||
                        !specie ||
                        !sex ||
                        !breed ||
                        !petBirthDate ||
                        !weight ||
                        !animalColor ||
                        !petOrigin ||
                        (petOrigin === "others" && !petOriginOthersOption) ||
                        !ownership ||
                        !habitat ||
                        !tag ||
                        (tag === "others" && !tagOthersOption)
                          ? "bg-gray-600"
                          : "bg-green-700"
                      }`}
                    >
                      Update
                    </button>
                  </div>
                </div>
                <hr className="border border-green-700 w-full" />
                <div className="flex flex-col sm:flex-row p-5 gap-3 sm:gap-6 pb-6">
                  <div className="grid grid-cols-2 w-full gap-3">
                    <div>
                      <div>
                        <label htmlFor="petName">Pet Name</label>
                        <input
                          type="text"
                          name="petName"
                          id="petName"
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          placeholder="Pet Name"
                          className="input-style"
                        />
                      </div>
                      <div>
                        <label htmlFor="specie">Specie</label>
                        <select
                          name="specie"
                          id="specie"
                          value={specie}
                          onChange={(e) =>
                            setSpecie(
                              e.target.value as "cat" | "dog" | undefined | ""
                            )
                          }
                          className="input-style"
                        >
                          <option value=""> -- Select --</option>
                          <option value="cat">Cat</option>
                          <option value="dog">Dog</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="sex">Sex</label>
                        <select
                          name="sex"
                          id="sex"
                          value={sex}
                          onChange={(e) => setSex(e.target.value)}
                          className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                        >
                          <option value=""> -- Select --</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="breed">Breed</label>
                        <Select
                          name="breed"
                          id="breed"
                          value={breed ? { label: breed, value: breed } : null}
                          onChange={(
                            option: { value: string; label: string } | null
                          ) => setBreed(option ? option.value : "")}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          options={breedOptions}
                        />
                      </div>
                      <div>
                        <label htmlFor="petBirthDate">Birthdate</label>
                        <input
                          type="date"
                          name="petBirthDate"
                          id="petBirthDate"
                          value={petBirthDate}
                          onChange={(e) => setPetBirthDate(e.target.value)}
                          className="input-style"
                        />
                      </div>
                      <div>
                        <label htmlFor="weight">Weight</label>
                        <input
                          type="number"
                          name="weight"
                          id="weight"
                          value={weight}
                          placeholder="Weight (in kgs)"
                          onChange={(e) => setWeight(e.target.value)}
                          className="input-style"
                        />
                      </div>
                      <div>
                        <label htmlFor="animalColor">Animal Color</label>
                        <input
                          type="text"
                          name="animalColor"
                          id="animalColor"
                          value={animalColor}
                          placeholder="Animal Color"
                          onChange={(e) => setAnimalColor(e.target.value)}
                          className="input-style"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex gap-2 w-full">
                        <div
                          className={`${petOrigin !== "others" && "w-full"}`}
                        >
                          <label htmlFor="petOrigin">Pet Origin</label>
                          <select
                            name="petOrigin"
                            id="petOrigin"
                            value={petOrigin}
                            onChange={(e) => {
                              setPetOrigin(e.target.value);
                            }}
                            className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                          >
                            <option value=""> -- Select --</option>
                            <option value="local">Local</option>
                            <option value="others">Others</option>
                          </select>
                        </div>
                        {petOrigin === "others" && (
                          <div>
                            <label htmlFor="petOriginOthersOption">
                              Others
                            </label>
                            <input
                              type="text"
                              name="petOriginOthersOption"
                              id="petOriginOthersOption"
                              value={petOriginOthersOption}
                              placeholder="Pet Origin Others"
                              onChange={(e) =>
                                setPetOriginOthersOption(e.target.value)
                              }
                              className="input-style"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="ownership">Ownership</label>
                        <select
                          name="ownership"
                          id="ownership"
                          value={ownership}
                          onChange={(e) => setOwnership(e.target.value)}
                          className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                        >
                          <option value=""> -- Select --</option>
                          <option value="household">Household</option>
                          <option value="community">Community</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="habitat">Habitat</label>
                        <select
                          name="habitat"
                          id="habitat"
                          value={habitat}
                          onChange={(e) => setHabitat(e.target.value)}
                          className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                        >
                          <option value=""> -- Select --</option>
                          <option value="caged">Caged</option>
                          <option value="leased">Leased</option>
                          <option value="free-roaming">Free Roaming</option>
                          <option value="house-only">House Only</option>
                        </select>
                      </div>
                      <div className="flex gap-2 w-full">
                        <div className={`${tag !== "others" && "w-full"}`}>
                          <label htmlFor="tag">Tag</label>
                          <select
                            name="tag"
                            id="tag"
                            value={tag}
                            onChange={(e) => {
                              setTag(e.target.value);
                            }}
                            className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                          >
                            <option value=""> -- Select --</option>
                            <option value="collar-tag">Collar Tag</option>
                            <option value="microchip">Microchip</option>
                            <option value="tattoo-code">Tattoo Code</option>
                            <option value="others">Others</option>
                          </select>
                        </div>
                        {tag === "others" && (
                          <div>
                            <label htmlFor="tagOthersOption">Others</label>
                            <input
                              type="text"
                              name="tagOthersOption"
                              id="tagOthersOption"
                              value={tagOthersOption}
                              placeholder="Pet Origin Others"
                              onChange={(e) =>
                                setTagOthersOption(e.target.value)
                              }
                              className="input-style"
                            />
                          </div>
                        )}
                      </div>
                      {sex === "female" && (
                        <>
                          <div>
                            <label htmlFor="isPregnant">Pregnant</label>
                            <select
                              name="isPregnant"
                              id="isPregnant"
                              value={isPregnant ? "yes" : "no"}
                              onChange={(e) =>
                                setIsPregnant(e.target.value === "yes")
                              }
                              className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                            >
                              <option value="no">No</option>
                              <option value="yes">Yes</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="isLactating">
                              Lactating with Puppies
                            </label>
                            <select
                              name="isLactating"
                              id="isLactating"
                              value={isLactating ? "yes" : "no"}
                              onChange={(e) =>
                                setIsLactating(e.target.value === "yes")
                              }
                              className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                            >
                              <option value="no">No</option>
                              <option value="yes">Yes</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="numPups">No. of Puppies</label>
                            <input
                              type="number"
                              name="numPups"
                              id="numPups"
                              value={numPups}
                              placeholder="No. of Puppies"
                              onChange={(e) =>
                                setNumPups(Number(e.target.value))
                              }
                              className="input-style"
                            />
                          </div>
                        </>
                      )}
                      {/* <div className="flex flex-col">
                        <label htmlFor="dateVaccinated">Date Vaccinated</label>
                        <input
                          type="date"
                          name="dateVaccinated"
                          id="dateVaccinated"
                          value={dateVaccinated}
                          onChange={(e) => setDateVaccinated(e.target.value)}
                          className="input-style"
                        />
                        <span className="text-xs italic text-end w-full">
                          (leave blank if no history of vaccination)
                        </span>
                      </div> */}
                      {/* <div>
                        <label htmlFor="petOwner">Pet Owner</label>
                        <select
                          name="petOwner"
                          id="petOwner"
                          value={petOwner}
                          onChange={(e) => setPetOwner(e.target.value)}
                          className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full">
                          <option value=""> -- Select --</option>
                          <option value="test1">test1</option>
                          <option value="test2">test2</option>
                        </select>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showInsertModal && (
            <div
              className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-hidden`}
            >
              <div
                className={`rounded-2xl 
              bg-white text-black mx-3 md:w-[52rem]`}
              >
                <div className="flex justify-between items-center  py-3 px-5">
                  {" "}
                  <h2 className="text-xl font-semibold">Insert New Pet</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowInsertModal(false);

                        setNewPetName("");
                        setNewSpecie("");
                        setNewSex("");
                        setNewBreed("");
                        setNewPetBirthDate("");
                        setNewWeight("");
                        setNewAnimalColor("");
                        setNewPetOrigin("");
                        setNewPetOriginOthersOption("");
                        setNewOwnership("");
                        setNewHabitat("");
                        setNewTag("");
                        setNewTagOtherOption("");
                        setNewIsPregnant(false);
                        setNewIsLactating(false);
                        setNewNumPups(0);
                        // setNewDateVaccinated("");
                        setNewPetOwner("");
                      }}
                      className="bg-red-600 flex text-lg rounded-xl px-3 py-1 text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(event) => handleInsertEvent(event)}
                      disabled={
                        !newPetName ||
                        !newSpecie ||
                        !newSex ||
                        !newBreed ||
                        !newPetBirthDate ||
                        !newWeight ||
                        !newAnimalColor ||
                        !newPetOrigin ||
                        (newPetOrigin === "others" &&
                          !newPetOriginOthersOption) ||
                        !newOwnership ||
                        !newHabitat ||
                        !newTag ||
                        (newTag === "others" && !newTagOtherOption)

                        // !newPetOwner
                      }
                      className={`flex text-lg rounded-xl px-3 py-1 text-white ${
                        !newPetName ||
                        !newSpecie ||
                        !newSex ||
                        !newBreed ||
                        !newPetBirthDate ||
                        !newWeight ||
                        !newAnimalColor ||
                        !newPetOrigin ||
                        (newPetOrigin === "others" &&
                          !newPetOriginOthersOption) ||
                        !newOwnership ||
                        !newHabitat ||
                        !newTag ||
                        (newTag === "others" && !newTagOtherOption)
                          ? // !newPetOwner
                            "bg-gray-600"
                          : "bg-green-700"
                      }`}
                    >
                      Insert
                    </button>
                  </div>
                </div>
                <hr className="border border-green-700 w-full" />
                <div className="flex flex-col sm:flex-row p-5 gap-3 sm:gap-6 pb-6">
                  <div className="grid grid-cols-2 w-full gap-3">
                    <div>
                      <div>
                        <label htmlFor="newPetName">Pet Name</label>
                        <input
                          type="text"
                          name="newPetName"
                          id="newPetName"
                          value={newPetName}
                          onChange={(e) => setNewPetName(e.target.value)}
                          placeholder="Pet Name"
                          className="input-style"
                        />
                      </div>
                      <div>
                        <label htmlFor="newSpecie">Specie</label>
                        <select
                          name="newSpecie"
                          id="newSpecie"
                          value={newSpecie}
                          onChange={(e) =>
                            setNewSpecie(
                              e.target.value as "cat" | "dog" | undefined | ""
                            )
                          }
                          className="input-style"
                        >
                          <option value=""> -- Select --</option>
                          <option value="cat">Cat</option>
                          <option value="dog">Dog</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="newSex">Sex</label>
                        <select
                          name="newSex"
                          id="newSex"
                          value={newSex}
                          onChange={(e) => setNewSex(e.target.value)}
                          className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                        >
                          <option value=""> -- Select --</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="newBreed">Breed</label>
                        <Select
                          name="newBreed"
                          id="newBreed"
                          value={
                            newBreed
                              ? { label: newBreed, value: newBreed }
                              : null
                          }
                          onChange={(
                            option: { value: string; label: string } | null
                          ) => setNewBreed(option ? option.value : "")}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          options={breedOptions}
                        />
                      </div>
                      <div>
                        <label htmlFor="newPetBirthDate">Birthdate</label>
                        <input
                          type="date"
                          name="newPetBirthDate"
                          id="newPetBirthDate"
                          value={newPetBirthDate}
                          onChange={(e) => setNewPetBirthDate(e.target.value)}
                          className="input-style"
                        />
                      </div>
                      <div>
                        <label htmlFor="newWeight">Weight</label>
                        <input
                          type="number"
                          name="newWeight"
                          id="newWeight"
                          value={newWeight}
                          placeholder="Weight (in kgs)"
                          onChange={(e) => setNewWeight(e.target.value)}
                          className="input-style"
                        />
                      </div>
                      <div>
                        <label htmlFor="newAnimalColor">Animal Color</label>
                        <input
                          type="text"
                          name="newAnimalColor"
                          id="newAnimalColor"
                          value={newAnimalColor}
                          placeholder="Animal Color"
                          onChange={(e) => setNewAnimalColor(e.target.value)}
                          className="input-style"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex gap-2 w-full">
                        <div
                          className={`${newPetOrigin !== "others" && "w-full"}`}
                        >
                          <label htmlFor="newPetOrigin">Pet Origin</label>
                          <select
                            name="newPetOrigin"
                            id="newPetOrigin"
                            value={newPetOrigin}
                            onChange={(e) => {
                              setNewPetOrigin(e.target.value);
                              setNewPetOriginOthersOption("");
                            }}
                            className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                          >
                            <option value=""> -- Select --</option>
                            <option value="local">Local</option>
                            <option value="others">Others</option>
                          </select>
                        </div>
                        {newPetOrigin === "others" && (
                          <div>
                            <label htmlFor="newPetOriginOthersOption">
                              Others
                            </label>
                            <input
                              type="text"
                              name="newPetOriginOthersOption"
                              id="newPetOriginOthersOption"
                              value={newPetOriginOthersOption}
                              placeholder="Pet Origin Others"
                              onChange={(e) =>
                                setNewPetOriginOthersOption(e.target.value)
                              }
                              className="input-style"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="newOwnership">Ownership</label>
                        <select
                          name="newOwnership"
                          id="newOwnership"
                          value={newOwnership}
                          onChange={(e) => setNewOwnership(e.target.value)}
                          className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                        >
                          <option value=""> -- Select --</option>
                          <option value="household">Household</option>
                          <option value="community">Community</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="newHabitat">Habitat</label>
                        <select
                          name="newHabitat"
                          id="newHabitat"
                          value={newHabitat}
                          onChange={(e) => setNewHabitat(e.target.value)}
                          className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                        >
                          <option value=""> -- Select --</option>
                          <option value="caged">Caged</option>
                          <option value="leased">Leased</option>
                          <option value="free-roaming">Free Roaming</option>
                          <option value="house-only">House Only</option>
                        </select>
                      </div>
                      <div className="flex gap-2 w-full">
                        <div className={`${newTag !== "others" && "w-full"}`}>
                          <label htmlFor="newTag">Tag</label>
                          <select
                            name="newTag"
                            id="newTag"
                            value={newTag}
                            onChange={(e) => {
                              setNewTag(e.target.value);
                              setNewTagOtherOption("");
                            }}
                            className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                          >
                            <option value=""> -- Select --</option>
                            <option value="collar-tag">Collar Tag</option>
                            <option value="microchip">Microchip</option>
                            <option value="tattoo-code">Tattoo Code</option>
                            <option value="others">Others</option>
                          </select>
                        </div>
                        {newTag === "others" && (
                          <div>
                            <label htmlFor="newTagOtherOption">Others</label>
                            <input
                              type="text"
                              name="newTagOtherOption"
                              id="newTagOtherOption"
                              value={newTagOtherOption}
                              placeholder="Pet Origin Others"
                              onChange={(e) =>
                                setNewTagOtherOption(e.target.value)
                              }
                              className="input-style"
                            />
                          </div>
                        )}
                      </div>
                      {newSex === "female" && (
                        <>
                          <div>
                            <label htmlFor="newIsPregnant">Pregnant</label>
                            <select
                              name="newIsPregnant"
                              id="newIsPregnant"
                              value={newIsPregnant ? "yes" : "no"}
                              onChange={(e) =>
                                setNewIsPregnant(e.target.value === "yes")
                              }
                              className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                            >
                              <option value="no">No</option>
                              <option value="yes">Yes</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="newIsLactating">
                              Lactating with Puppies
                            </label>
                            <select
                              name="newIsLactating"
                              id="newIsLactating"
                              value={newIsLactating ? "yes" : "no"}
                              onChange={(e) =>
                                setNewIsLactating(e.target.value === "yes")
                              }
                              className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                            >
                              <option value="no">No</option>
                              <option value="yes">Yes</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="newNumPups">No. of Puppies</label>
                            <input
                              type="number"
                              name="newNumPups"
                              id="newNumPups"
                              value={newNumPups}
                              placeholder="No. of Puppies"
                              onChange={(e) =>
                                setNewNumPups(Number(e.target.value))
                              }
                              className="input-style"
                            />
                          </div>
                        </>
                      )}
                      {/* <div className="flex flex-col">
                        <label htmlFor="newDateVaccinated">
                          Date Vaccinated
                        </label>
                        <input
                          type="date"
                          name="newDateVaccinated"
                          id="newDateVaccinated"
                          value={newDateVaccinated}
                          onChange={(e) => setNewDateVaccinated(e.target.value)}
                          className="input-style"
                        />
                        <span className="text-xs italic text-end w-full">
                          (leave blank if no history of vaccination)
                        </span>
                      </div> */}
                      {/* <div>
                        <label htmlFor="petOwner">Pet Owner</label>
                        <select
                          name="petOwner"
                          id="petOwner"
                          value={petOwner}
                          onChange={(e) => setPetOwner(e.target.value)}
                          className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full">
                          <option value=""> -- Select --</option>
                          <option value="test1">test1</option>
                          <option value="test2">test2</option>
                        </select>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showInsertAppointmentModal && (
            <div
              className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-hidden`}
            >
              <div
                className={`rounded-2xl 
              bg-white text-black mx-3 `}
              >
                <div className="flex justify-between items-center py-3 px-5 gap-10">
                  {" "}
                  <h2 className="text-xl font-semibold">Add New Appointment</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowInsertAppointmentModal(false);

                        setSelectedAppointment(undefined);
                        setSelectedTime("");
                        setTimeSlots([]);
                        setSelectedPets([]);
                      }}
                      className="bg-red-600 flex text-lg rounded-xl px-3 py-1 text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(event) => handleNewAppointment(event)}
                      disabled={
                        isSubmitting ||
                        !selectedAppointment ||
                        !selectedTime ||
                        !selectedPets ||
                        selectedPets.length === 0
                      }
                      className={`flex text-lg rounded-xl px-3 py-1 text-white ${
                        isSubmitting ||
                        !selectedAppointment ||
                        !selectedTime ||
                        !selectedPets ||
                        !selectedPets ||
                        selectedPets.length === 0
                          ? "bg-gray-600"
                          : "bg-green-700"
                      }`}
                    >
                      Add
                    </button>
                  </div>
                </div>
                <hr className="border border-green-700 w-full" />
                <div className="flex flex-col sm:flex-row p-5 gap-3 sm:gap-6 pb-6">
                  <div className=" w-full flex flex-col gap-3">
                    <div>
                      <label htmlFor="selectedAppointment">Appointment</label>
                      <Select
                        name="selectedAppointment"
                        id="selectedAppointment"
                        value={selectedAppointment || ""}
                        onChange={(selectedOption) => {
                          setTimeSlots([]);
                          if (
                            selectedOption &&
                            typeof selectedOption === "object"
                          ) {
                            setSelectedAppointment(selectedOption);
                            generateTimeSlots(selectedOption);
                          } else {
                            setSelectedAppointment(undefined);
                            setTimeSlots([]);
                          }
                        }}
                        options={appointments}
                        className="basic-multi-select"
                        classNamePrefix="select"
                      />
                    </div>
                    {selectedAppointment && (
                      <div>
                        <label htmlFor="selectedTime">Time</label>
                        <select
                          name="selectedTime"
                          id="selectedTime"
                          value={selectedTime || ""}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className={`${
                            timeSlots.length === 0 && "text-purple-700 italic"
                          } border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10  rounded-lg p-2 w-full`}
                        >
                          {timeSlots.length === 0 ? (
                            <option>Loading...</option>
                          ) : (
                            timeSlots.map((timeSlot, index) => (
                              <option key={index} value={timeSlot.time}>
                                {timeSlot.time} (Remaining slots:{" "}
                                {timeSlot.remainingSlots})
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    )}
                    <div>
                      <NextSelect
                        aria-label="Pet to vaccinate"
                        placeholder="Choose pet/s to vaccinate"
                        selectionMode="multiple"
                        radius="none"
                        className="w-full"
                        value={selectedPets}
                        onChange={(event) => {
                          const pets = event.target.value.split(",");
                          setSelectedPets(pets);
                        }}
                      >
                        {records
                          .filter(
                            (availablePet) =>
                              availablePet.date_vaccinated === null
                          )
                          .map((availablePet) => (
                            <SelectItem
                              key={availablePet.id}
                              value={availablePet.id}
                            >
                              {availablePet.pet_name.charAt(0).toUpperCase() +
                                availablePet.pet_name.slice(1)}
                            </SelectItem>
                          ))}
                      </NextSelect>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showAppointmentDeletePrompt && (
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
                      onClick={() => setShowAppointmentDeletePrompt(false)}
                      className="bg-gray-600 flex text-lg rounded-xl px-3 py-1 text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(event) => handleAppointmentDeleteEvent(event)}
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
          {showProcessModal && (
            <div
              className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-hidden`}
            >
              <div
                className={`rounded-2xl 
              bg-white text-black mx-3 w-96`}
              >
                <div className="flex justify-between items-center py-3 px-5 gap-10">
                  <h2 className="text-xl font-semibold">Appointment Process</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowProcessModal(false);
                      }}
                      className="bg-red-600 flex text-lg rounded-xl px-3 py-1 text-white"
                    >
                      Exit
                    </button>
                  </div>
                </div>
                <hr className="border border-green-700 w-full" />
                <div className="my-4 flex h-full w-full justify-center items-center gap-4 px-4">
                  <button onClick={prevImage} className="text-xl">
                    <GrPrevious />
                  </button>
                  <div className="flex flex-col items-center justify-center gap-3 w-full">
                    <div
                      className="bg-white rounded-lg shadow-md p-4 flex justify-center items-center w-full"
                      style={{ height: "220px" }}
                    >
                      <Image
                        src={"/" + images[currentIndex]}
                        // fill
                        width={100}
                        height={100}
                        style={{
                          objectFit: "contain",
                          width: "100%",
                          height: "100%",
                        }}
                        alt={`Logo ${currentIndex + 1}`}
                      />
                    </div>
                    <div className="bg-gray-300 rounded-lg shadow-md py-2 px-4 flex justify-center items-center w-full flex-wrap text-sm text-center h-14">
                      <p>{texts[currentIndex]}</p>
                    </div>
                  </div>

                  <button onClick={nextImage} className="text-xl">
                    <GrNext />
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col md:flex-row justify-between items-center py-2 w-full h-[5dvh] mb-5">
            <Image
              src={"/pet-vax-logo-no-text.svg"}
              width={50}
              height={50}
              alt="Logo"
            />
            <div className="flex gap-3 md:gap-5">
              <div
                className="relative flex items-center justify-center space-x-4"
                ref={dropdownRefNotif}
              >
                <button
                  className="flex items-center text-2xl space-x-2"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setIsNotificationClicked(false);
                  }}
                >
                  {isNotificationClicked ? (
                    <Badge
                      isOneChar
                      content={<IoAlertCircle />}
                      color="danger"
                      shape="circle"
                      placement="top-right"
                    >
                      <MdOutlineNotificationsNone />
                    </Badge>
                  ) : (
                    <MdOutlineNotificationsNone />
                  )}
                </button>
                {showNotifications && (
                  <div
                    className={`absolute top-full mt-2 bg-gray-600 opacity-95 text-gray-400 py-2 pr-8 md:pr-0 px-3 w-[18rem] md:w-96 h-36 -right-52 md:-left-56 rounded-lg z-40 flex flex-col`}
                  >
                    <div className="absolute w-3 h-3 bg-inherit transform rotate-45 left-[47.5%] md:left-3/4 -top-1.5 translate-x-[-620%]" />

                    {/* <div className="flex items-center self-end md:pr-5 gap-4">
                      {notifications && notifications.length > 0 && (
                        <button onClick={() => setToggleClear(!toggleClear)}>
                          {toggleClear ? "Cancel" : "Clear"}
                        </button>
                      )}
                    </div> */}
                    <div className="w-full py-3 px-2 text-md opacity-100 text-green-300 flex flex-col gap-5 overflow-y-auto scrollbar-hide">
                      {Array.isArray(notifications) &&
                        notifications?.map(
                          (notification, index) =>
                            notification.message && (
                              <div
                                key={index}
                                className="flex gap-2 items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="bg-green-700 text-white rounded-full p-2 ">
                                    <MdOutlineAnnouncement />
                                  </div>
                                  <div>
                                    <h5 className="w-full whitespace-normal word-wrap">
                                      {notification.message}
                                    </h5>
                                    <h6 className="text-xs text-blue-400">
                                      {notification.submessage}
                                    </h6>
                                  </div>
                                </div>
                              </div>
                            )
                        )}
                    </div>
                  </div>
                )}
              </div>
              <div
                className="w-full relative flex flex-col md:flex-row gap-3 md:gap-0 pr-5 items-center justify-between space-x-4"
                ref={dropdownRefMenu}
              >
                <button
                  className="flex items-center text-2xl gap-x-2"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <CgProfile />
                  <h5 className="text-base md:text-xl">
                    Hi,{" "}
                    <span className="text-green-700 font-semibold">
                      {userName}
                    </span>
                  </h5>
                </button>
                {showMenu && (
                  <div className="absolute top-full mt-2 bg-gray-600 text-gray-400 opacity-95 py-2 pl-3 pr-14 md:right-[0.20rem] rounded-lg z-40">
                    <div className="absolute w-3 h-3 bg-inherit transform rotate-45 left-3/4 -top-1.5 translate-x-[-50%]" />
                    <button
                      className="flex items-center text-lg space-x-2 text-green-300 hover:text-red-300 my-3"
                      onClick={() => {
                        setShowSettingsChange(true);
                        setShowMenu(false);
                      }}
                    >
                      <div className="bg-green-700 text-white rounded-full p-2">
                        <IoSettingsOutline />
                      </div>
                      <h5 className="text-md">Settings</h5>
                    </button>
                    <button
                      className="flex items-center text-lg space-x-2 text-green-300 hover:text-red-300 my-3"
                      onClick={() => {
                        setLoading(true);
                        supabase.auth.signOut();
                        localStorage.removeItem("name");
                        localStorage.removeItem("userId");
                        router.push("/");
                      }}
                    >
                      <div className="bg-green-700 text-white rounded-full p-2">
                        <IoLogOutOutline />
                      </div>
                      <h5 className="text-md">Logout</h5>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full overflow-y-hidden overflow-x-hidden rounded-t-3xl rounded-b-3xl h-full gap-4 flex flex-col">
            <div className="flex h-full w-full flex-col">
              <Tabs key="Tabs" color="success" aria-label="Tabs" radius="full">
                <Tab key="pets" title="Pets" className="h-full">
                  <Card className="h-full">
                    <CardBody
                      className="h-full md:grid grid-cols-1 md:grid-cols-2 overflow-y-auto md:overflow-hidden gap-3"
                      style={{ gridTemplateColumns: "1fr .5fr" }}
                    >
                      <div className="md:overflow-y-auto md:border md:border-green-700 md:rounded-xl md:p-4">
                        <div className="flex justify-end mb-3">
                          <Button
                            color="success"
                            onClick={() => setShowInsertModal(true)}
                          >
                            + Add New Pet
                          </Button>
                        </div>
                        <div className="overflow-y-auto flex flex-col md:grid grid-cols-3 gap-5">
                          {records.length > 0 ? (
                            records.map((record, index) => (
                              <Card
                                key={index}
                                className="py-4 shadow-none bg-green-100"
                              >
                                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                  <div className="text-tiny uppercase font-bold">
                                    {record.date_vaccinated ? (
                                      <span>
                                        Date Vaccinated: &nbsp;
                                        <span>
                                          {new Date(
                                            record.date_vaccinated
                                          ).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                          })}
                                        </span>
                                      </span>
                                    ) : (
                                      <span>No vaccination history</span>
                                    )}
                                  </div>
                                  <small className="text-default-500">
                                    {record.date_vaccinated &&
                                      (function () {
                                        const dateVaccinated = new Date(
                                          record.date_vaccinated
                                        );
                                        const currentDate = new Date();
                                        const nextVaccinationDate = new Date(
                                          dateVaccinated.setFullYear(
                                            dateVaccinated.getFullYear() + 1
                                          )
                                        );
                                        const diffTime =
                                          nextVaccinationDate.getTime() -
                                          currentDate.getTime();
                                        const diffDays = Math.ceil(
                                          diffTime / (1000 * 60 * 60 * 24)
                                        );

                                        if (diffDays <= 90) {
                                          return (
                                            <span className="text-red-500 text-xs mb-2">
                                              {diffDays <= 0
                                                ? "You need to vaccinate this pet"
                                                : diffDays <= 7
                                                ? `Vaccination due in ${diffDays} day(s)`
                                                : diffDays <= 30
                                                ? "Vaccination due in 1 month"
                                                : diffDays <= 60
                                                ? "Vaccination due in 2 months"
                                                : `Vaccination due in ${diffDays} days`}
                                            </span>
                                          );
                                        }
                                        return "";
                                      })()}
                                  </small>
                                  <div className="w-full flex justify-between">
                                    <h4 className="font-bold text-large">
                                      {record.pet_name}
                                    </h4>
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        className="text-2xl hover:scale-125 transition delay-75 duration-300 ease-in-out hover:text-blue-600"
                                        onClick={() =>
                                          handleEditClick(record.id)
                                        }
                                      >
                                        <MdOutlineEdit />
                                      </button>
                                      <button
                                        className="text-2xl hover:scale-125 transition delay-75 duration-300 ease-in-out hover:text-red-600"
                                        onClick={() =>
                                          handleDeleteClick(record.id)
                                        }
                                      >
                                        <MdOutlineDelete />
                                      </button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardBody className="overflow-visible py-2 w-full flex items-center">
                                  <div className="w-full h-full rounded-lg p-2">
                                    <h2>
                                      <span className="font-semibold">
                                        Specie:{" "}
                                      </span>
                                      {record.specie}
                                    </h2>
                                    <h2>
                                      <span className="font-semibold">
                                        Sex:{" "}
                                      </span>{" "}
                                      {record.sex}
                                    </h2>
                                    <h2>
                                      <span className="font-semibold">
                                        Breed:{" "}
                                      </span>{" "}
                                      {record.breed}
                                    </h2>
                                    <h2>
                                      <span className="font-semibold">
                                        Age:{" "}
                                      </span>
                                      {(() => {
                                        const birthDate = parseISO(
                                          record.birth_date
                                        );
                                        const ageInYears = differenceInYears(
                                          new Date(),
                                          birthDate
                                        );
                                        const ageInMonths = differenceInMonths(
                                          new Date(),
                                          birthDate
                                        );

                                        if (ageInYears >= 1) {
                                          return `${ageInYears} year${
                                            ageInYears > 1 ? "s" : ""
                                          }`;
                                        } else {
                                          return `${ageInMonths} month${
                                            ageInMonths > 1 ? "s" : ""
                                          }`;
                                        }
                                      })()}
                                    </h2>
                                    <h2>
                                      {" "}
                                      <span className="font-semibold">
                                        Weight:{" "}
                                      </span>
                                      {record.weight}
                                    </h2>
                                    <h2>
                                      <span className="font-semibold">
                                        Color:{" "}
                                      </span>{" "}
                                      {record.color}
                                    </h2>
                                    <h2>
                                      <span className="font-semibold">
                                        Pet Origin:{" "}
                                      </span>{" "}
                                      {record.pet_origin}
                                    </h2>
                                    <h2>
                                      <span className="font-semibold">
                                        Ownership:{" "}
                                      </span>{" "}
                                      {record.ownership}
                                    </h2>
                                    <h2>
                                      <span className="font-semibold">
                                        Color:{" "}
                                      </span>{" "}
                                      {record.habitat}
                                    </h2>
                                    <h2>
                                      <span className="font-semibold">
                                        Tag:{" "}
                                      </span>{" "}
                                      {record.tag}
                                    </h2>
                                    {record.sex === "female" && (
                                      <>
                                        <h2>
                                          <span className="font-semibold">
                                            Pregnant:{" "}
                                          </span>{" "}
                                          {record.is_pregnant ? "Yes" : "No"}
                                        </h2>
                                        <h2>
                                          <span className="font-semibold">
                                            Lactating with Puppies:{" "}
                                          </span>{" "}
                                          {record.is_lactating_with_puppies
                                            ? "Yes"
                                            : "No"}
                                        </h2>
                                        <h2>
                                          <span className="font-semibold">
                                            No. of Puppies:{" "}
                                          </span>{" "}
                                          {record.num_puppies}
                                        </h2>
                                      </>
                                    )}
                                    {/* <div className="col-span-2 flex items-center justify-center h-full bg-gray-200 rounded-2xl">
                                    {record.specie === "dog" ? (
                                      <NextImage
                                        className="object-cover rounded-xl"
                                        src="/arf.svg"
                                        // src="https://nextui.org/images/hero-card-complete.jpeg"
                                        alt="Dog Arf"
                                        width={170}

                                        // width={270}
                                      />
                                    ) : (
                                      <NextImage
                                        className="object-cover rounded-xl"
                                        src="/meow.svg"
                                        alt="Cat Meow"
                                        width={170}
                                      />
                                    )}
                                  </div> */}
                                  </div>
                                </CardBody>
                              </Card>
                            ))
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center text-lg text-gray-500">
                                No records
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="h-full hidden md:block md:overflow-y-auto">
                        {historyRecords.length > 0 ? (
                          historyRecords.map(renderHistoryRecord)
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center text-lg text-gray-500">
                              No history
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Tab>
                <Tab key="schedule" title="Schedule" className="h-full">
                  <Card className="h-full">
                    <CardBody
                      className="h-full md:grid grid-cols-1 md:grid-cols-2 overflow-y-auto md:overflow-hidden gap-3"
                      style={{ gridTemplateColumns: "1fr .5fr" }}
                    >
                      <div className="md:overflow-y-auto md:border md:border-green-700 md:rounded-xl md:p-4 z-0">
                        <div className="flex justify-end mb-3">
                          <NextSelect
                            aria-labelledby="locationSelector"
                            items={locationItems}
                            value={locationSelector}
                            onChange={(e) =>
                              setLocationSelector(e.target.value)
                            }
                            placeholder={locationSelector ? "" : "All"}
                            color="success"
                            className="max-w-xs"
                          >
                            {(item) => (
                              <SelectItem key={item.value}>
                                {item.label}
                              </SelectItem>
                            )}
                          </NextSelect>
                        </div>
                        <Scheduler
                          view="month"
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
                                {event.notes && <p>Notes: {event.notes}</p>}
                              </div>
                            );
                          }}
                        />
                      </div>
                      <div className="h-full hidden md:block md:overflow-y-auto">
                        <div className="h-full">
                          <div className="flex justify-center items-center mb-3 gap-5">
                            <h1 className="text-sm text-gray-400 text-justify">
                              Note: If pet/s are already vaccinated within the
                              current year, pet/s in select option won&lsquo;t
                              be visible. To know the process, click{" "}
                              <span
                                onClick={() => setShowProcessModal(true)}
                                className="text-cyan-700 cursor-pointer"
                              >
                                this
                              </span>
                              .
                            </h1>
                            <div>
                              <Button
                                color="success"
                                onClick={() =>
                                  setShowInsertAppointmentModal(true)
                                }
                              >
                                + Add new appointment
                              </Button>
                            </div>
                          </div>
                          {appointmentRecords.length > 0 ? (
                            appointmentRecords.map((record, index) => (
                              <div
                                key={index}
                                className="flex flex-col w-full border border-green-700 rounded-xl p-4 mb-2"
                              >
                                <div className="flex justify-between items-center">
                                  <h1 className="font-bold text-lg text-green-700">
                                    {(() => {
                                      const appointmentDateTime = new Date(
                                        `${record.appointment_date}T${record.appointment_time}`
                                      );
                                      return (
                                        appointmentDateTime.toLocaleDateString(
                                          "en-US",
                                          {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                          }
                                        ) +
                                        " - " +
                                        appointmentDateTime.toLocaleTimeString(
                                          "en-US",
                                          { hour: "2-digit", minute: "2-digit" }
                                        )
                                      );
                                    })()}
                                  </h1>
                                  <div className="flex items-center justify-center gap-4">
                                    <button
                                      className="text-2xl hover:scale-125 transition delay-75 duration-300 ease-in-out hover:text-red-600"
                                      onClick={() =>
                                        handleAppointmentDeleteClick(record.id)
                                      }
                                    >
                                      <MdOutlineDelete />
                                    </button>
                                  </div>
                                </div>
                                <h2>
                                  <span className="font-semibold">
                                    Ticket Number:{" "}
                                  </span>{" "}
                                  {record.ticket_num}
                                </h2>
                                <h2>
                                  <span className="font-semibold">
                                    Location:{" "}
                                  </span>
                                  {record.vaccine_location}
                                </h2>
                                <h2>
                                  <span className="font-semibold">
                                    Pet Name:{" "}
                                  </span>
                                  {record.pet_name}
                                </h2>
                              </div>
                            ))
                          ) : (
                            <div className="w-full h-full flex items-center justify-center -my-12">
                              <div className="text-center text-lg text-gray-500">
                                No appointments
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Tab>
                <Tab
                  key="appointments"
                  title="Appointments"
                  className="h-full block md:hidden"
                >
                  <Card className="h-full">
                    <CardBody>
                      <div className="h-full">
                        <div className="flex flex-col justify-center items-center mb-3 gap-5">
                          <div>
                            <Button
                              color="success"
                              onClick={() =>
                                setShowInsertAppointmentModal(true)
                              }
                            >
                              + Add new appointment
                            </Button>
                          </div>
                          <h1 className="text-sm text-gray-400 text-justify">
                            Note: If pet/s are already vaccinated within the
                            current year, pet/s in select option won&lsquo;t be
                            visible. To know the process, click{" "}
                            <span
                              onClick={() => setShowProcessModal(true)}
                              className="text-cyan-700 cursor-pointer"
                            >
                              this
                            </span>
                            .
                          </h1>
                        </div>
                        {appointmentRecords.length > 0 ? (
                          appointmentRecords.map((record, index) => (
                            <div
                              key={index}
                              className="flex flex-col w-full border border-green-700 rounded-xl p-4 mb-2"
                            >
                              <div className="flex justify-between items-center">
                                <h1 className="font-bold text-lg text-green-700">
                                  {(() => {
                                    const appointmentDateTime = new Date(
                                      `${record.appointment_date}T${record.appointment_time}`
                                    );
                                    return (
                                      appointmentDateTime.toLocaleDateString(
                                        "en-US",
                                        {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        }
                                      ) +
                                      " - " +
                                      appointmentDateTime.toLocaleTimeString(
                                        "en-US",
                                        { hour: "2-digit", minute: "2-digit" }
                                      )
                                    );
                                  })()}
                                </h1>
                                <div className="flex items-center justify-center gap-4">
                                  <button
                                    className="text-2xl hover:scale-125 transition delay-75 duration-300 ease-in-out hover:text-red-600"
                                    onClick={() =>
                                      handleAppointmentDeleteClick(record.id)
                                    }
                                  >
                                    <MdOutlineDelete />
                                  </button>
                                </div>
                              </div>
                              <h2>
                                <span className="font-semibold">
                                  Ticket Number:{" "}
                                </span>{" "}
                                {record.ticket_num}
                              </h2>
                              <h2>
                                <span className="font-semibold">
                                  Location:{" "}
                                </span>
                                {record.vaccine_location}
                              </h2>
                              <h2>
                                <span className="font-semibold">
                                  Pet Name:{" "}
                                </span>
                                {record.pet_name}
                              </h2>
                            </div>
                          ))
                        ) : (
                          <div className="w-full h-full flex items-center justify-center -my-20">
                            <div className="text-center text-lg text-gray-500">
                              No appointments
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Tab>
                <Tab
                  key="history"
                  title="History"
                  className="h-full block md:hidden"
                >
                  <Card className="h-full">
                    <CardBody>
                      <div className="h-full">
                        {historyRecords.length > 0 ? (
                          historyRecords.map(renderHistoryRecord)
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center text-lg text-gray-500">
                              No history
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetOwnerDashboard;

function renderHistoryRecord(record: any, index: number) {
  return (
    <div
      key={index}
      className="flex flex-col w-full border border-green-700 rounded-xl p-4 mb-4"
    >
      <h2>
        <span className="font-semibold">Pet Name: </span> {record?.pet_name}
      </h2>
      <h2>
        <span className="font-semibold">Vaccine: </span> {record?.vaccine_name}
      </h2>
      <h2>
        <span className="font-semibold">Schedule: </span>{" "}
        {new Date(record?.vax_sched_date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </h2>
      <h2 className="text-red-700">
        Next Vaccination: {""}
        {new Date(
          new Date(record?.vax_sched_date).setFullYear(
            new Date(record?.vax_sched_date).getFullYear() + 1
          )
        ).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </h2>
      <h2>
        <span className="font-semibold">Location: </span> {record?.location}
      </h2>
    </div>
  );
}
