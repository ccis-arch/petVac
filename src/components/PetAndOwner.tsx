"use client";
import { useCallback, useEffect, useState } from "react";
import {
  MdFilter,
  MdOutlineDelete,
  MdOutlineEdit,
  MdOutlineFilterAlt,
  MdOutlineSearch,
  MdOutlineWarning,
} from "react-icons/md";
import {
  fetchPetRecord,
  editPetRecord,
  deletePetRecord,
  fetchPetRecordForVaccination,
} from "@/data/pet_records_data";
import {
  fetchPetOwnerRecord,
  editPetOwnerRecord,
  deletePetOwnerRecord,
} from "@/data/pet_owners_data";
// import { insertSampleData } from "@/data/insertSampleData";
import Select, { OptionProps, GroupBase, components } from "react-select";
import { useRouter, usePathname } from "next/navigation";

import { PetOwner, PetCount } from "@/types/interfaces";
import { locations } from "@/data/barangayData";
import { supabase } from "@/utils/supabase";
import { fetchVaccineScheduleForAppointment } from "@/data/vaccine_sched_data";
import {
  editVMSRecord,
  fetchVMSRecordForVaccination,
  updateVaccineInventoryWithInventoryID,
} from "@/data/vaccine_management_data";
import { insertVaccinationRecord } from "@/data/vaccinationRecordsData";
import {
  checkIfDataExists,
  insertDistributedVaccines,
  updateDistributedVaccineWithDateAndBarangay,
  updateDistributedVaccineWithInventoryID,
} from "@/data/distributed_vaccines_data";
import {
  checkIfDistributedVaccinatHaveInvetoryIdOfVaccinatedPet,
  checkIfVaccinationRecordHavePetID,
  checkVaccineIdInVaccineInventory,
} from "@/data/deletionOfPetToCascadeData";
import { LoadingScreenSection } from "./LoadingScreen";
import { updateAppointmentStatus } from "@/data/appointmentData";

import { Select as NextSelect, SelectItem } from "@nextui-org/react";
import { months, years } from "@/data/otherData";
import { set } from "date-fns";

const PetAndOwner = () => {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 9;
  const [petCounts, setPetCounts] = useState<PetCount[]>([]);
  const [numOfEntries, setNumOfEntries] = useState(1);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [showEditPrompt, setShowEditPrompt] = useState(false);

  // filter
  const [typeFilter, setTypeFilter] = useState("pet");
  const [statusFilter, setStatusFilter] = useState("");

  // admin filter
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [activateFilter, setActivateFilter] = useState(0);

  type Record = any | PetOwner;

  const [records, setRecords] = useState<any[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  const userType = pathname.includes("/admin/")
    ? "admin"
    : pathname.includes("/personnel/")
    ? "personnel"
    : null;

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

  //Pet Owner Data
  const [ownerId, setOwnerId] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState("");
  const [ownerBirthDate, setOwnerBirthDate] = useState("");
  const [barangay, setBarangay] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // insertSampleData();

  const headerNames =
    typeFilter === "pet"
      ? [
          "Date Vaccinated",
          "Pet Name",
          "Specie",
          "Sex",
          "Breed",
          "Birthdate",
          "Weight (kgs)",
          "Animal Color",
          "Pet Origin",
          "Ownership",
          "Habitat",
          "Tag",
          "Pregnant",
          "Lactating",
          "No. of Puppies",
          "Owner",
          "Status",
          "Action",
        ]
      : [
          "Pet Owner ID Number",
          "Date Registered",
          "Last Name",
          "First Name",
          "Gender",
          "Birthdate",
          "Barangay",
          "Phone Number",
          "Pets Owned",
          "Action",
        ];

  // Memoized data fetching functions
  const memoizedFetchPetRecordsData = useCallback(async () => {
    try {
      const response = await fetchPetRecord(
        searchValue,
        statusFilter,
        yearFilter,
        monthFilter,
        locationFilter,
        entriesPerPage,
        currentPage
      );

      if (response && "data" in response && "count" in response) {
        setRecords(response.data);
        setNumOfEntries(response.count || 1);

        // update date_vaccinated of pet if past due
        response.data.map(async (record) => {
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
              date_vaccinated: null,
            };
            await editPetRecord(record.id, updatedRecord);
          }
          return record;
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [searchValue, activateFilter, entriesPerPage, currentPage]);

  const memoizedFetchPetOwnerRecordsData = useCallback(async () => {
    try {
      const response = await fetchPetOwnerRecord(
        searchValue,
        locationFilter,
        entriesPerPage,
        currentPage
      );
      setRecords(response?.data || []);
      setPetCounts(response?.petCounts || []);
      setNumOfEntries(response?.count || 1);
      setLoading(false);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [searchValue, activateFilter, entriesPerPage, currentPage]);

  useEffect(() => {
    if (typeFilter === "pet") {
      memoizedFetchPetRecordsData();

      const channel = supabase
        .channel(`realtime pet data sessions`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "ViewPetRecordsWithOwners",
          },
          (payload) => {
            if (payload.new) {
              setRecords((prevRecord) => [
                payload.new as Record,
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
            table: "ViewPetRecordsWithOwners",
          },
          (payload) => {
            if (payload.new) {
              setRecords((prevRecord: any) =>
                prevRecord.map((record: any) =>
                  record.id === payload.new.id
                    ? { ...record, ...payload.new }
                    : record
                )
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      memoizedFetchPetOwnerRecordsData();

      const channel = supabase
        .channel(`realtime pet owner data sessions`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "PetOwnerProfiles",
          },
          (payload) => {
            if (payload.new) {
              setRecords((prevRecord) => [
                payload.new as Record,
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
            table: "PetOwnerProfiles",
          },
          (payload) => {
            if (payload.new) {
              setRecords((prevRecord: any) =>
                prevRecord.map((record: any) =>
                  record.id === payload.new.id ? payload.new : record
                )
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [
    searchValue,
    typeFilter,
    entriesPerPage,
    currentPage,
    memoizedFetchPetRecordsData,
    memoizedFetchPetOwnerRecordsData,
  ]);

  // Function to handle edit click
  const handleEditClick = (id: string) => {
    // Find the record with the matching id
    const record = records.find((record) => record.id === id);

    if (record) {
      if (typeFilter === "pet") {
        const petRecord = record as any;
        setPetId(petRecord.id);
        setDateVaccinated(
          petRecord.date_vaccinated
            ? new Date(petRecord.date_vaccinated).toISOString().substring(0, 10)
            : ""
        );
        setPetName(petRecord.pet_name);
        setSpecie(petRecord.specie);
        setSex(petRecord.sex);
        setBreed(petRecord.breed || "");
        setPetBirthDate(petRecord.birth_date);
        setWeight(petRecord.weight ? petRecord.weight.toString() : "");
        setAnimalColor(petRecord.color || "");
        set;

        setPetOwner(
          petRecord.owner_first_name + " " + petRecord.owner_last_name
        );

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
      } else if (typeFilter === "owner") {
        const ownerRecord = record as PetOwner;
        setOwnerId(ownerRecord.id);
        setLastName(ownerRecord.last_name);
        setFirstName(ownerRecord.first_name);
        setGender(ownerRecord.gender);
        setOwnerBirthDate(ownerRecord.birth_date);
        setBarangay(ownerRecord.barangay || "");
        setPhoneNumber(ownerRecord.phone_number);
      }
      setShowEditPrompt(true);
    }
  };

  const handleDeleteClick = (id: string) => {
    const record = records.find((record) => record.id === id);

    if (record) {
      if (typeFilter === "pet") {
        setPetId(record.id);
      } else if (typeFilter === "owner") {
        setOwnerId(record.id);
      }
      setShowDeletePrompt(true);
    }
  };

  const handleUpdateEvent = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (typeFilter === "pet") {
      const updatedRecord = {
        date_vaccinated: dateVaccinated ? new Date(dateVaccinated) : null,
        pet_name: petName,
        specie: specie,
        sex: sex,
        breed: breed,
        birth_date: petBirthDate,
        weight: parseFloat(weight),
        color: animalColor,
        // owner_id: ownerId,
      };

      await editPetRecord(petId, updatedRecord);

      setRecords(
        records.map((record) =>
          record.id === petId ? { ...record, ...updatedRecord } : record
        )
      );
    } else if (typeFilter === "owner") {
      const updatedRecord = {
        last_name: lastName,
        first_name: firstName,
        gender: gender,
        birth_date: ownerBirthDate,
        barangay: barangay,
        phone_number: phoneNumber,
      };

      await editPetOwnerRecord(ownerId, updatedRecord);

      setRecords(
        records.map((record) =>
          record.id === ownerId ? { ...record, ...updatedRecord } : record
        )
      );
    }
    setShowEditPrompt(false);
  };

  const handleDeleteEvent = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (typeFilter === "pet") {
      await deletePetRecord(petId);
      setRecords(records.filter((record) => record.id !== petId));
    } else if (typeFilter === "owner") {
      await deletePetOwnerRecord(ownerId);
      setRecords(records.filter((record) => record.id !== ownerId));
    }
    setShowDeletePrompt(false);
  };

  const [showVaccinatePet, setShowVaccinatePet] = useState(false);

  const [appointments, setAppointments] = useState<
    { value: any; label: string; location: string; date: string }[]
  >([]);

  const [selectedAppointment, setSelectedAppointment] = useState<
    { value: any; label: string; location: string } | undefined
  >(undefined);

  const [vaccines, setVaccines] = useState<
    {
      value: any;
      label: string;
      name: string;
      expiration_date: string;
      remaining_qty: number;
    }[]
  >([]);

  const [selectedVaccine, setSelectedVaccine] = useState<
    { value: any; label: string; remaining_qty: number } | undefined
  >(undefined);

  // add the appointment id
  const [petOptions, setPetOptions] = useState<
    {
      value: any;
      label: string;
      pet_name: string;
      owner: string;
      schedule: number;
      appointment_date: string;
    }[]
  >([]);

  const [selectedPetOption, setSelectedPetOption] = useState<
    | { value: any; label: string; schedule: number; appointment_date: string }
    | undefined
  >(undefined);

  useEffect(() => {
    const fetchVaxSched = async () => {
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

            const label = `${appointment.location}: ${formattedDate}`;

            return {
              value: appointment.id,
              label: label,
              location: appointment.location,
              date: formattedDate,
            };
          })
        );
      }
    };

    fetchVaxSched();
  }, []);

  useEffect(() => {
    const fetchVaxSched = async () => {
      const response = await fetchVMSRecordForVaccination();
      if (response && response.data) {
        setVaccines(
          response.data
            .filter((record) => record.remaining_qty !== 0)
            .map((record) => {
              const expiration_date = new Date(record.expiration_date);
              const formattedDate = expiration_date.toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              );

              const label = `${record.name}: ${formattedDate}`;

              return {
                value: record.id,
                label: label,
                name: record.name,
                expiration_date: formattedDate,
                remaining_qty: record.remaining_qty,
              };
            })
        );
      }
    };
    fetchVaxSched();
  }, []);

  useEffect(() => {
    const fetchVaxSched = async () => {
      if (selectedAppointment) {
        const response = await fetchPetRecordForVaccination(
          selectedAppointment.value
        );
        if (response && response.data) {
          setPetOptions(
            response.data.map((record) => {
              const label = `${record.pet_name} - ${record.first_name} ${record.last_name}`;

              return {
                value: record.id,
                label: label,
                pet_name: record.pet_name,
                owner: `${record.first_name} ${record.last_name}`,
                schedule: record.schedule_id,
                appointment_date: record.appointment_date,
              };
            })
          );
        }
      }
    };

    fetchVaxSched();
  }, [selectedAppointment]);

  const handleVaccinatePet = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    const newRecord = {
      vax_sched_id: selectedAppointment?.value,
      vaccine_id: selectedVaccine?.value,
      pet_id: selectedPetOption?.value,
    };

    const response = await insertVaccinationRecord(newRecord);

    if (response?.error) {
      console.error("Error inserting event:", response.error);
    } else {
      if (selectedPetOption) {
        await updateAppointmentStatus(selectedPetOption.schedule, "ved");

        const updatedRecord = {
          date_vaccinated: selectedPetOption.appointment_date,
        };

        await editPetRecord(selectedPetOption.value, updatedRecord);
      }

      setSelectedPetOption(undefined);

      const updatedVaccineRecord = {
        remaining_qty: selectedVaccine ? selectedVaccine.remaining_qty - 1 : 0,
      };
      const vaccineResponse = await editVMSRecord(
        selectedVaccine?.value,
        updatedVaccineRecord
      );

      if (vaccineResponse) {
        const currentDate = new Date();
        const specificLocation = selectedAppointment?.location || "";
        const inventoryID = selectedVaccine?.value;

        const existingData = await checkIfDataExists(
          specificLocation,
          currentDate.toISOString(),
          inventoryID
        );

        if (existingData && existingData.length > 0) {
          await updateDistributedVaccineWithDateAndBarangay(
            specificLocation,
            currentDate.toISOString(),
            inventoryID,
            { num_vaccines: existingData[0]?.num_vaccines + 1 }
          );
        } else {
          await insertDistributedVaccines({
            inventory_id: inventoryID,
            date: currentDate,
            num_vaccines: 1,
            barangay: specificLocation,
          });
        }
      }
    }
  };

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

  const [loading, setLoading] = useState(true);

  return (
    <>
      <div className="flex flex-col gap-10 h-full w-full">
        {loading && <LoadingScreenSection />}

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
                <h2 className="text-xl font-semibold">
                  {typeFilter === "pet"
                    ? "Edit Pet Information"
                    : "Edit Pet Owner Information"}
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditPrompt(false)}
                    className="bg-red-600 flex text-lg rounded-xl px-3 py-1 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(event) => handleUpdateEvent(event)}
                    // disabled={!location || !date || !time}
                    className={`flex text-lg rounded-xl px-3 py-1 bg-green-700 text-white `}
                  >
                    Update
                  </button>
                </div>
              </div>
              <hr className="border border-green-700 w-full" />
              <div className="flex flex-col sm:flex-row p-5 gap-3 sm:gap-6 pb-6">
                {typeFilter === "pet" ? (
                  <>
                    <div className="flex flex-col w-full gap-3">
                      <div>
                        <label htmlFor="dateVaccinated">Date Vaccinated</label>
                        <input
                          type="date"
                          name="dateVaccinated"
                          id="dateVaccinated"
                          value={dateVaccinated}
                          onChange={(e) => setDateVaccinated(e.target.value)}
                          className="input-style"
                        />
                      </div>
                      <div>
                        <label htmlFor="petName">Pet Name</label>
                        <input
                          type="text"
                          name="petName"
                          id="petName"
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
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
                          onChange={(e) => setAnimalColor(e.target.value)}
                          className="input-style"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col w-full gap-3">
                      <div>
                        <label htmlFor="petOwner">Pet Owner</label>
                        <input
                          type="text"
                          name="petOwner"
                          id="petOwner"
                          disabled
                          value={petOwner}
                          className="input-style"
                        />
                      </div>
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
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col w-full gap-3">
                      <div>
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="input-style"
                        />
                      </div>
                      <div>
                        <label htmlFor="firstName">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="input-style"
                        />
                      </div>
                      <div>
                        <label htmlFor="gender">Gender</label>
                        <select
                          name="gender"
                          id="gender"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                        >
                          <option value=""> -- Select --</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="others">Others</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col w-full gap-3">
                      <div>
                        <label htmlFor="ownerBirthDate">Birthdate</label>
                        <input
                          type="date"
                          name="ownerBirthDate"
                          id="ownerBirthDate"
                          value={ownerBirthDate}
                          onChange={(e) => setOwnerBirthDate(e.target.value)}
                          className="input-style"
                        />
                      </div>
                      <div>
                        <label htmlFor="barangay">Barangay</label>
                        <select
                          name="barangay"
                          id="barangay"
                          value={barangay}
                          onChange={(e) => setBarangay(e.target.value)}
                          className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 rounded-lg p-2 w-full"
                        >
                          <option value=""> -- Select --</option>
                          {locations.map((location) => (
                            <option key={location} value={location}>
                              {location}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                          type="text"
                          name="phoneNumber"
                          id="phoneNumber"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="input-style"
                        />
                      </div>
                    </div>
                  </>
                )}
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
                    // disabled={!location || !date || !time}
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
        {showVaccinatePet && (
          <div
            className={`z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 bg-black overflow-y-auto`}
          >
            <div
              className={`rounded-2xl 
              bg-white text-black mx-3 md:w-[26rem]`}
            >
              <div className="flex justify-between items-center  py-3 px-5">
                {" "}
                <h2 className="text-xl font-semibold">Vaccinate Pet</h2>
                <div className="flex gap-3 justify-between">
                  <button
                    onClick={() => {
                      setShowVaccinatePet(false);
                      setSelectedAppointment(undefined);
                      setSelectedVaccine(undefined);
                      setSelectedPetOption(undefined);
                    }}
                    className="bg-purple-600 flex text-lg rounded-xl px-3 py-1 text-white"
                  >
                    OK
                  </button>
                  <button
                    onClick={(event) => handleVaccinatePet(event)}
                    disabled={
                      !selectedAppointment ||
                      !selectedVaccine ||
                      !selectedPetOption
                    }
                    className={`${
                      !selectedAppointment ||
                      !selectedVaccine ||
                      !selectedPetOption
                        ? "bg-gray-700"
                        : "bg-green-700"
                    }  flex text-lg rounded-xl px-3 py-1  text-white `}
                  >
                    Continue
                  </button>
                </div>
              </div>
              <hr className="border border-green-700 w-full" />
              <div className="flex flex-col sm:flex-row p-5 gap-3 sm:gap-6 pb-6">
                <>
                  <div className="flex flex-col w-full gap-3">
                    <div>
                      <label htmlFor="selectedAppointment">Appointment</label>
                      <Select
                        name="selectedAppointment"
                        id="selectedAppointment"
                        value={selectedAppointment || ""}
                        onChange={(selectedOption) => {
                          if (
                            selectedOption &&
                            typeof selectedOption === "object"
                          ) {
                            setSelectedAppointment(selectedOption);
                          } else {
                            setSelectedAppointment(undefined);
                          }
                        }}
                        options={appointments}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        components={{ Option: CustomOptionAppointment }}
                      />
                    </div>
                    <div>
                      <label htmlFor="selectedVaccine">Vaccine</label>
                      <Select
                        name="selectedVaccine"
                        id="selectedVaccine"
                        value={selectedVaccine || ""}
                        onChange={(selectedOption) => {
                          if (
                            selectedOption &&
                            typeof selectedOption === "object"
                          ) {
                            setSelectedVaccine(selectedOption);
                          } else {
                            setSelectedVaccine(undefined);
                          }
                        }}
                        options={vaccines}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        components={{ Option: CustomOptionVaccine }}
                      />
                    </div>
                    <div>
                      <label htmlFor="selectedPetOption">Pet</label>
                      <Select
                        name="selectedPetOption"
                        id="selectedPetOption"
                        value={selectedPetOption || ""}
                        onChange={(selectedOption) => {
                          if (
                            selectedOption &&
                            typeof selectedOption === "object"
                          ) {
                            setSelectedPetOption(selectedOption);
                          } else {
                            setSelectedPetOption(undefined);
                          }
                        }}
                        options={petOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        components={{ Option: CustomOptionPetOption }}
                      />
                    </div>
                  </div>
                </>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center flex-col md:flex-row w-full text-center">
          <h1 className="flex font-bold text-3xl text-green-700">
            {userType === "admin" ? "Pet and Owner Records" : "Pet Records"}
          </h1>
          {userType === "personnel" && (
            <button
              type="submit"
              className="bg-green-700 flex text-lg rounded-xl px-5 py-2 text-white"
              onClick={() => setShowVaccinatePet(true)}
            >
              Vaccinate Pet
            </button>
          )}
        </div>
        <div className="w-full flex flex-col items-center justify-center h-full gap-5">
          <div className={`w-full flex gap-3 justify-between`}>
            <div className="flex flex-col justify-center items-start">
              <label htmlFor="statusFilter">Search</label>
              <div className="relative">
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
            </div>

            <div className="flex items-center gap-3">
              {userType === "admin" && (
                // <NextSelect
                //   name="typeFilter"
                //   id="typeFilter"
                //   defaultSelectedKeys={["pet"]}
                //   value={typeFilter}
                //   color="success"
                //   onChange={(e) => {
                //     setTypeFilter(e.target.value);
                //     setSearchValue("");
                //     setStatusFilter("");
                //     setCurrentPage(1);
                //     setNumOfEntries(1);
                //   }}>
                //   <SelectItem key={"pet"}>Pets</SelectItem>
                //   <SelectItem key={"owner"}>Owners</SelectItem>
                // </NextSelect>
                <div className="flex flex-col justify-center items-center">
                  <label htmlFor="typeFilter">Type</label>
                  <select
                    name="typeFilter"
                    id="typeFilter"
                    className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10  rounded-full py-2 "
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                    }}
                  >
                    <option value="pet">Pets</option>
                    <option value="owner">Owners</option>
                  </select>
                </div>
              )}
              {typeFilter === "pet" && (
                <>
                  <div className="flex flex-col justify-center items-center">
                    <label htmlFor="statusFilter">Status</label>
                    <select
                      name="statusFilter"
                      id="typeFilter"
                      className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10  rounded-full py-2 w-48"
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                      }}
                    >
                      <option value="">All</option>
                      <option value="ved">Ved</option>
                      <option value="uved">UVed</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-center items-center">
                    <label htmlFor="yearFilter">Year</label>
                    <select
                      name="yearFilter"
                      id="yearFilter"
                      className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10  rounded-full py-2 w-48"
                      onChange={(e) => {
                        setYearFilter(e.target.value);
                      }}
                    >
                      <option value="">All</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col justify-center items-center">
                    <label htmlFor="monthFilter">Month</label>
                    <select
                      name="monthFilter"
                      id="monthFilter"
                      className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10  rounded-full py-2 w-48"
                      onChange={(e) => {
                        setMonthFilter(e.target.value);
                      }}
                    >
                      <option value="">All</option>
                      {months.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div className="flex flex-col justify-center items-center">
                <label htmlFor="locationFilter">Location</label>
                <select
                  name="locationFilter"
                  id="locationFilter"
                  className="border border-green-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10  rounded-full py-2"
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                  }}
                >
                  <option value="">All</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-center items-center">
                <br />
                <button
                  className="bg-green-700 flex text-2xl rounded-xl px-5 py-2 text-white cursor-pointer"
                  onClick={() => setActivateFilter(activateFilter + 1)}
                >
                  <MdOutlineFilterAlt />
                </button>
              </div>
            </div>
          </div>
          {/* md:w-[92rem] */}
          <div className="w-full sm:overflow-y-hidden rounded-t-3xl rounded-b-3xl h-[65dvh] border border-green-700 overflow-x-auto">
            <table className="text-sm text-center w-full">
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
                    className="w-full bg-white border-b border-green-700 hover:bg-green-100"
                  >
                    {typeFilter === "pet" ? (
                      <>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).date_vaccinated
                            ? new Date(
                                (record as any).date_vaccinated!
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).pet_name}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).specie}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).sex}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).breed}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {new Date(
                            (record as any).birth_date
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).weight}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).color}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).pet_origin}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).ownership}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).habitat}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).tag}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).sex === "female"
                            ? (record as any).is_pregnant
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).sex === "female"
                            ? (record as any).is_lactating_with_puppies
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as any).sex === "female"
                            ? (record as any).num_puppies
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {`${(record as any).owner_first_name} ${
                            (record as any).owner_last_name
                          }`}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          <div
                            className={`${
                              (record as any).date_vaccinated
                                ? " bg-blue-700"
                                : " bg-red-700"
                            } text-white w-16 rounded-full py-1 px-2`}
                          >
                            {(record as any).date_vaccinated ? "Ved" : "UVed"}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as PetOwner).id}
                        </td>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 font-mono"
                        >
                          {new Date(
                            (record as PetOwner).date_registered
                          ).toLocaleDateString()}
                        </th>
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
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as PetOwner).barangay}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {(record as PetOwner).phone_number}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {petCounts.find(
                            (count) =>
                              count.owner_id === (record as PetOwner).id
                          )?.pet_count || 0}
                        </td>
                      </>
                    )}
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

export default PetAndOwner;

const CustomOptionAppointment: React.FC<OptionProps<any, false>> = (props) => {
  const { data, innerProps } = props;
  return (
    <components.Option {...props}>
      <div className="flex justify-between items-center">
        {/* <h5>data.label</h5> */}
        <h5>{data.location}</h5>
        <h5 className="text-xs text-blue-700">{data.date}</h5>
      </div>
    </components.Option>
  );
};

const CustomOptionVaccine: React.FC<OptionProps<any, false>> = (props) => {
  const { data, innerProps } = props;
  return (
    <components.Option {...props}>
      <div className="flex justify-between items-center">
        {/* <h5>data.label</h5> */}
        <h5>{data.name}</h5>
        <h5 className="text-xs text-blue-700">{data.expiration_date}</h5>
      </div>
    </components.Option>
  );
};

const CustomOptionPetOption: React.FC<OptionProps<any, false>> = (props) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <div className="flex justify-between items-center">
        <h5>{data.pet_name}</h5>
        <h5 className="text-xs text-blue-700">{data.owner}</h5>
      </div>
    </components.Option>
  );
};
