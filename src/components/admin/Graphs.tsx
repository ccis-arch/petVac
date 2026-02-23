"use client";
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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  fetchVaccinatedPets,
  fetchVaccinatedPetsByBarangay,
} from "@/data/vaccinationRecordsData";

// interface PetOwnerProfile {
//   id: string;
//   first_name: string;
//   last_name: string;
//   barangay: string;
// }

// interface PetRecord {
//   id: string;
//   pet_name: string;
//   specie: string;
//   status: string;
//   PetOwnerProfiles: PetOwnerProfile;
// }

const Graphs = () => {
  const [records, setRecords] = useState<Record<string, number>>({});
  const [cats, setCats] = useState(0);
  const [dogs, setDogs] = useState(0);
  const [barangayData, setBarangayData] = useState<Record<string, number>>({});

  const memoizedFetchVaccinatedPetsData = useCallback(async () => {
    try {
      const response = await fetchVaccinatedPets("");
      setRecords(response?.totalRecords || {});
      setCats(response?.totalCats || 0);
      setDogs(response?.totalDogs || 0);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, []);

  useEffect(() => {
    memoizedFetchVaccinatedPetsData();
  }, []);

  const memoizedVaccinatedPetsByBarangay = useCallback(async () => {
    try {
      const response = await fetchVaccinatedPetsByBarangay();
      // console.log("response1", response);

      response && setBarangayData(response);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, []);

  useEffect(() => {
    memoizedVaccinatedPetsByBarangay();
  }, []);

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
    indexAxis: "y" as const,
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

  const dataTotalRecords = {
    labels: Object.keys(records),
    datasets: [
      {
        label: "Number of Records",
        data: Object.values(records),
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
    labels: [`Cats - ${cats}%`, `Dogs - ${dogs}%`],
    datasets: [
      {
        data: [cats, dogs],
        backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
      },
    ],
  };

  const optionsPerBarangay = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Vaccinated Pets in Each Barangay",
      },
    },
  };

  const dataPerBarangay = {
    labels: Object.keys(barangayData),
    datasets: [
      {
        label: "Number of Records",
        data: Object.values(barangayData),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        // borderColor: "rgba(75, 192, 192, 1)",
        // borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <div
        id="graphs"
        className="w-full h-60 flex flex-col sm:flex-row space-y-5 sm:space-y-0 sm:space-x-5 bg-white">
        <div
          id="bar-graph-container"
          className="h-full w-full sm:w-[70%] bg-white flex justify-between rounded-xl px-5 py-7">
          <Bar options={optionsTotalRecords} data={dataTotalRecords} />
        </div>
        <div
          id="doughnut-graph-container"
          className="h-full w-full sm:w-[30%] bg-white flex justify-between rounded-xl px-5 py-7">
          <Doughnut options={optionsDoughnut} data={dataDoughnut} />
        </div>
        <div
          id="bar-graph2-container"
          className="h-full w-full sm:w-[70%] bg-white flex justify-between rounded-xl px-5 py-7">
          <Bar options={optionsPerBarangay} data={dataPerBarangay} />
        </div>
      </div>
    </>
  );
};

export default Graphs;

export const exportGraphsToPdf = () => {
  const ids = [
    "bar-graph-container",
    "bar-graph2-container",
    "doughnut-graph-container",
  ];
  const pdf = new jsPDF("p", "pt", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  let currentHeight = 0;
  let imgHeight = (pdfHeight / ids.length) * 0.8; // increase the height
  let imgWidth = pdfWidth * 1.2; // increase the width

  const offScreenDiv = document.createElement("div");
  document.body.appendChild(offScreenDiv);

  const root = createRoot(offScreenDiv);
  root.render(<Graphs />);

  setTimeout(() => {
    pdf.setFontSize(18); // set the font size
    pdf.text("Report", pdfWidth / 2, 30, { align: "center" }); // add the "Report" text at the top
    currentHeight += 40; // adjust the currentHeight to account for the added text

    ids.forEach((id, index) => {
      const input = offScreenDiv.querySelector(`#${id}`) as HTMLElement;
      if (input === null) return;
      html2canvas(input, { backgroundColor: "#ffffff" }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const imgAspectRatio = canvas.width / canvas.height;
        imgWidth = id === "doughnut-graph-container" ? pdfWidth / 2 : pdfWidth; // set a fixed width for the pie chart
        imgHeight = imgWidth / imgAspectRatio;
        const imgX = (pdfWidth - imgWidth) / 2; // calculate the x position for centering the image
        pdf.addImage(imgData, "JPEG", imgX, currentHeight, imgWidth, imgHeight); // use the calculated x position
        currentHeight += imgHeight;
        if (index === ids.length - 1) {
          pdf.save("pet-vaccination-system_graphs.pdf");
          document.body.removeChild(offScreenDiv);
        }
      });
    });
  }, 2000);
};
