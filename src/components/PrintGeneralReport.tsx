import React, { useEffect, useState } from "react";

interface PrintGeneralReportProps {
  filter: string;
}

const PrintGeneralReport = React.forwardRef<
  HTMLDivElement,
  PrintGeneralReportProps
>((props, ref) => {
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      //   const data = await fetchRegisteredVehicles();
      //   setData(data || []);
    };

    fetchData();
  }, []);

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", {
    month: "long",
  });
  const currentDay = currentDate.getDate();
  const currentYear = currentDate.getFullYear();

  return (
    <>
      <div></div>
    </>
  );
});

PrintGeneralReport.displayName = "PrintGeneralReport";

export default PrintGeneralReport;
