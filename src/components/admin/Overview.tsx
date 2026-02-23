// import LeafletComponent from "./LeafletComponent";
import Image from "next/image";
import {
  fetchPetOwnerRegistered,
  fetchPetOwnersRegisteredAllBarangay,
} from "@/data/overview_data";
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useRef, useState } from "react";

import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import dynamic from "next/dynamic";
import { locations } from "@/data/barangayData";
import {
  fetchVaccinationRecordsEachBarangay,
  fetchVaccinationRecordsEachBarangayMoreDetails,
} from "@/data/vaccinationRecordsData";

interface CardStatsProps {
  title: string;
  subtitle: string;
  value: string;
  icon: string;
}

const LeafletComponent = dynamic(() => import("../LeafletComponent"), {
  ssr: false,
});

export const CardStats: React.FC<CardStatsProps> = ({
  title,
  subtitle,
  value,
  icon,
}) => {
  return (
    <div className="bg-white shadow-lg flex justify-between rounded-xl px-5 py-7">
      <div className="w-full">
        <h2 className="text-5xl font-bold text-green-700">{value}</h2>
        <h3 className="text-2xl font-semibold text-green-700">{title}</h3>
        <h4 className="text-md text-slate-400">{subtitle}</h4>
      </div>
      <div className="self-end w-full flex justify-end">
        <Image width={100} height={100} src={icon} alt={icon} />
      </div>
    </div>
  );
};

const Overview = () => {
  const position: [number, number] = [8.2165, 126.0458];
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const [overviewTotalVaccinatedPets, setOverviewTotalVaccinatedPets] =
    useState(0);
  const [
    overviewTotalDistributedVaccines,
    setOverviewTotalDistributedVaccines,
  ] = useState(0);
  const [
    overviewTotalRegisteredPetOwners,
    setOverviewTotalRegisteredPetOwners,
  ] = useState(0);
  const [
    overviewTotalVaccinatedCatsAndDogs,
    setOverviewTotalVaccinatedCatsAndDogs,
  ] = useState({ cats: 0, dogs: 0 });

  const [
    overviewTotalMonthlyVaccinatedPets,
    setOverviewTotalMonthlyVaccinatedPets,
  ] = useState<any>({});

  const [
    overviewTotaVaccinatedPetsPerBarangay,
    setOverviewTotalVaccinatedPetsPerBarangay,
  ] = useState<any>({});

  const [overviewTotalVaccinesAvailable, setOverviewTotalVaccinesAvailable] =
    useState(0);

  const [availableVaccines, setAvailableVaccines] = useState<
    { name: string; qty: number }[]
  >([]);

  useEffect(() => {
    supabase
      .from("TotalDistributedVaccinesPerYear")
      .select("*")
      .then(({ data, error }) => {
        if (error) console.error(error);
        else
          setOverviewTotalDistributedVaccines(
            data[0]?.total_distributed_vaccines
          );
      });

    supabase
      .from("TotalRegisteredPetOwners")
      .select("*")
      .then(({ data, error }) => {
        if (error) console.error(error);
        else
          setOverviewTotalRegisteredPetOwners(
            data[0]?.total_registered_pet_owner
          );
      });

    supabase
      .from("TotalVaccinatedCatsAndDogs")
      .select("*")
      .then(({ data, error }) => {
        if (error) console.error(error);
        else {
          const catData = data.find((item) => item.specie === "cat");
          const dogData = data.find((item) => item.specie === "dog");

          setOverviewTotalVaccinatedCatsAndDogs({
            cats: catData ? catData.total_vaccinated : 0,
            dogs: dogData ? dogData.total_vaccinated : 0,
          });
        }
      });

    supabase
      .from("TotalMonthlyVaccinatedPets")
      .select("*")
      .then(({ data, error }) => {
        if (error) console.error(error);
        else {
          const monthlyData = data.reduce((acc, item) => {
            acc[item.month] = item.total_vaccinated;
            return acc;
          }, {});

          const totalVaccinated = data.reduce(
            (acc, item) => acc + item.total_vaccinated,
            0
          );

          setOverviewTotalMonthlyVaccinatedPets(monthlyData);
          setOverviewTotalVaccinatedPets(totalVaccinated);
        }
      });
  }, []);

  useEffect(() => {
    let query = supabase.from("TotalVaccinatedPetsPerBarangay").select("*");

    if (selectedLocation) {
      query = query.eq("barangay", selectedLocation);
    }

    query.then(({ data, error }) => {
      if (error) console.error(error);
      else {
        const barangayData = data.reduce((acc, item) => {
          acc[item.barangay] = item.total_vaccinated;
          return acc;
        }, {});

        setOverviewTotalVaccinatedPetsPerBarangay(barangayData);
      }
    });
  }, [selectedLocation]);

  useEffect(() => {
    let query = supabase.from("VaccineInventory").select("*");

    query.then(({ data, error }) => {
      if (error) console.error(error);
      else {
        const totalVaccines = data.reduce(
          (acc, item) => acc + item.remaining_qty,
          0
        );

        setOverviewTotalVaccinesAvailable(totalVaccines);

        const availableVaccineData = data
          .filter((item) => item.remaining_qty > 0)
          .map((item) => ({ name: item.name, qty: item.remaining_qty }));

        setAvailableVaccines(availableVaccineData);
      }
    });
  }, []);

  // map
  const [
    overviewTotalRegisteredPetOwnersPerBarangay,
    setOverviewTotalRegisteredPetOwnersPerBarangay,
  ] = useState<any>({});

  useEffect(() => {
    let query = supabase
      .from("TotalRegisteredPetOwnersPerBarangay")
      .select("*");

    if (selectedLocation) {
      query = query.eq("barangay", selectedLocation);
    }

    query.then(({ data, error }) => {
      if (error) console.error(error);
      else {
        const barangayData = data.reduce((acc, item) => {
          acc[item.barangay] = item.total_registered_pet_owners;
          return acc;
        }, {});

        setOverviewTotalRegisteredPetOwnersPerBarangay(barangayData);
      }
    });
  }, [selectedLocation]);

  ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const optionsTotalRecords = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Vaccinated Pets for Each Month of the Current Year",
      },
    },
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dataTotalRecords = {
    labels: Object.keys(overviewTotalMonthlyVaccinatedPets).map(
      (monthNumber) => monthNames[parseInt(monthNumber) - 1]
    ),
    datasets: [
      {
        label: "Number of Records",
        data: Object.values(overviewTotalMonthlyVaccinatedPets),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        // borderColor: "rgba(75, 192, 192, 1)",
        // borderWidth: 1,
      },
    ],
  };

  const optionsDoughnut = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Vaccinated Pets in the Current Year",
      },
    },
  };

  const dataDoughnut = {
    labels: [
      `Cats - ${overviewTotalVaccinatedCatsAndDogs.cats}%`,
      `Dogs - ${overviewTotalVaccinatedCatsAndDogs.dogs}%`,
    ],
    datasets: [
      {
        data: [
          overviewTotalVaccinatedCatsAndDogs.cats,
          overviewTotalVaccinatedCatsAndDogs.dogs,
        ],
        backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
      },
    ],
  };

  // distribution

  const [vaccineDistributionRecord, setVaccineDistributionRecord] = useState<
    any[]
  >([]);
  const [distributionDetailsRecord, setDistributionDetailsRecord] = useState<
    any[]
  >([]);

  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const memoizedFetchRecords = useCallback(async () => {
    try {
      const response = await fetchVaccinationRecordsEachBarangay(filterDate);
      setVaccineDistributionRecord(response || []);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [filterDate]);

  const memoizedFetchMoreRecords = useCallback(async () => {
    try {
      const response = await fetchVaccinationRecordsEachBarangayMoreDetails(
        filterDate
      );
      setDistributionDetailsRecord(response || []);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [filterDate]);

  useEffect(() => {
    memoizedFetchRecords();
    memoizedFetchMoreRecords();
    const channel = supabase
      .channel(`realtime sessions`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "DistributedVaccines",
        },
        (payload) => {
          if (payload.new) {
            setVaccineDistributionRecord(payload.new as any);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [memoizedFetchRecords, memoizedFetchMoreRecords, filterDate]);

  const optionsDistributionRecords = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  const dataDistributionRecords = {
    labels: locations,
    datasets: [
      {
        label: "Number of records",
        data: locations.map((location) => {
          const record = vaccineDistributionRecord.find(
            (record) => record.location === location
          );
          return record ? record.record_count : 0;
        }),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  return (
    <>
      <div className="w-full h-full flex flex-col gap-5">
        <div className="grid md:grid-cols-4 gap-5">
          <CardStats
            title="Pets"
            subtitle="Vaccinated"
            value={overviewTotalVaccinatedPets.toString()}
            icon="/paw-print.png"
          />
          <CardStats
            title="Vaccines"
            subtitle="Distributed"
            // value={overviewTotalDistributedVaccines.toString()}
            value={overviewTotalVaccinatedPets.toString()}
            icon="/vaccinated.png"
          />
          <CardStats
            title="Vaccines"
            subtitle="Available"
            value={overviewTotalVaccinesAvailable.toString()}
            icon="/vaccine.png"
          />
          <CardStats
            title="Owners"
            subtitle="Registered"
            value={overviewTotalRegisteredPetOwners.toString()}
            icon="/pet-owner.png"
          />
        </div>
        <LeafletComponent
          position={position}
          onLocationClick={setSelectedLocation}
          totalVaccinatedPets={overviewTotaVaccinatedPetsPerBarangay}
          totalDistributedVaccines={overviewTotaVaccinatedPetsPerBarangay}
          totalPetOwnersRegistered={overviewTotalRegisteredPetOwnersPerBarangay}
        />
        <div className="w-full h-60 flex flex-col sm:flex-row space-y-5 sm:space-y-0 sm:space-x-5">
          <div className="h-full w-full sm:w-[15%] bg-white shadow-lg flex justify-between rounded-xl px-5 py-7">
            <div className="w-full flex flex-col">
              <div>
                <h3 className="text-2xl font-semibold text-green-700">
                  Vaccine
                </h3>
                <h4 className="text-md text-slate-400">Types</h4>
              </div>
              <ul className="h-full flex flex-col justify-center">
                {availableVaccines.map((vaccine, index) => (
                  <li key={index} className="flex justify-between">
                    {vaccine.name}
                    <span className="text-green-700 font-bold">
                      {vaccine.qty}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            // id="bar-graph-container"
            className="h-full w-full sm:w-[60%] bg-white shadow-lg flex justify-between rounded-xl px-5 py-7"
          >
            <Bar options={optionsTotalRecords} data={dataTotalRecords} />
          </div>
          <div
            // id="doughnut-graph-container"
            className="h-full w-full sm:w-[30%] bg-white shadow-lg flex justify-between rounded-xl px-5 py-7"
          >
            <Doughnut options={optionsDoughnut} data={dataDoughnut} />
          </div>
        </div>
        <div className="w-full h-96 flex flex-col sm:flex-row space-y-5 sm:space-y-0 sm:space-x-5">
          <div className="h-full w-full sm:w-[50%] bg-white shadow-lg flex flex-col justify-between rounded-xl px-5 pt-4 pb-10">
            <div className="flex justify-between">
              <h1 className="text-md text-green-700 font-medium">
                Vaccine Distribution Per Barangay
              </h1>
              <div className="flex gap-3">
                <label
                  className="text-md text-green-700 font-medium"
                  htmlFor="monthYear"
                >
                  Select Month/Year
                </label>
                <input
                  type="month"
                  id="monthYear"
                  name="monthYear"
                  className="font-semibold border-b"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
            </div>
            <Bar
              options={optionsDistributionRecords}
              data={dataDistributionRecords}
            />
          </div>
          <div className="h-full w-full sm:w-[50%] bg-white shadow-lg flex flex-col rounded-xl px-5 pt-4 pb-10">
            <h2 className="text-md text-green-700 font-medium">
              Vaccine Distribution Details
            </h2>
            <div className="h-full overflow-y-auto">
              <table className="h-full w-full text-sm text-center mt-3">
                <thead className="text-xs uppercase font-normal">
                  <tr className="whitespace-nowrap border-b">
                    <th>Pet Name</th>
                    <th>Breed</th>
                    <th>Pet Owner</th>
                    <th>Vaccine Name</th>
                  </tr>
                </thead>
                <tbody>
                  {distributionDetailsRecord.map((record, index) => (
                    <tr key={index} className="border-b">
                      <td>{record.pet_name}</td>
                      <td>{record.breed}</td>
                      <td>{record.pet_owner}</td>
                      <td>{record.vaccine_name}</td>
                    </tr>
                  ))}
                  {Array(Math.max(0, 5 - distributionDetailsRecord.length))
                    .fill(null)
                    .map((_, index) => (
                      <tr
                        key={distributionDetailsRecord.length + index}
                        className="border-b"
                      >
                        <th>&nbsp;</th>
                        <td>&nbsp;</td>
                        <th>&nbsp;</th>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
