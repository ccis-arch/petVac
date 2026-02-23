"use client";
import {
  BarChart,
  Bar,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { fetchVaccinatedPets } from "@/data/vaccinationRecordsData";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Graphs = () => {
  const [records, setRecords] = useState<Record<string, number>>({});
  const [cats, setCats] = useState(0);
  const [dogs, setDogs] = useState(0);

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

  const dataTotalRecords = Object.keys(records).map((key) => ({
    name: key,
    uv: records[key],
  }));

  const dataDoughnut = [
    { name: `Cats - ${cats}%`, value: cats },
    { name: `Dogs - ${dogs}%`, value: dogs },
  ];

  // console.log("dataDoughnut", dataDoughnut);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <>
      <div
        id="graphs"
        className="w-full h-60 flex flex-col sm:flex-row space-y-5 sm:space-y-0 sm:space-x-5 bg-white">
        <div
          id="bar-graph-container"
          className="h-full w-full sm:w-[70%] bg-white shadow-lg flex justify-between rounded-xl px-5 py-7">
          {/* <BarChart width={500} height={300} data={dataTotalRecords}>
            <Tooltip />
            <Legend />
            <Bar dataKey="uv" fill="#8884d8" />
          </BarChart> */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={dataTotalRecords}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="uv"
                fill="#82ca9d"
                activeBar={<Rectangle fill="gold" stroke="purple" />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div
          id="doughnut-graph-container"
          className="h-full w-full sm:w-[30%] bg-white shadow-lg flex justify-between rounded-xl px-5 py-7">
          {/* <PieChart width={400} height={400}>
            <Pie
              data={dataDoughnut}
              cx={200}
              cy={200}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value">
              {dataDoughnut.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart> */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={400} height={400}>
              <Pie
                data={dataDoughnut}
                cx="50%"
                cy="50%"
                labelLine={false}
                // label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value">
                {dataDoughnut.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default Graphs;

export const exportGraphsToPdf = () => {
  const ids = ["bar-graph-container", "doughnut-graph-container"];
  const pdf = new jsPDF("p", "pt", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  let currentHeight = 0;
  let imgHeight = (pdfHeight / ids.length) * 0.7;
  let imgWidth = pdfWidth;

  const offScreenDiv = document.createElement("div");
  document.body.appendChild(offScreenDiv);

  const root = createRoot(offScreenDiv);
  root.render(<Graphs />);

  setTimeout(() => {
    ids.forEach((id, index) => {
      const input = offScreenDiv.querySelector(`#${id}`) as HTMLElement;
      if (input === null) return;
      html2canvas(input, { backgroundColor: "#ffffff" }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const imgAspectRatio = canvas.width / canvas.height;
        imgWidth = pdfWidth;
        imgHeight = imgWidth / imgAspectRatio;
        pdf.addImage(imgData, "JPEG", 0, currentHeight, imgWidth, imgHeight);
        currentHeight += imgHeight;
        if (index === ids.length - 1) {
          pdf.save("pet-vaccination-system_graphs.pdf");
          document.body.removeChild(offScreenDiv);
        }
      });
    });
  }, 2000);
};
