const startYear = 2020;
const currentYear = new Date().getFullYear();
const endYear = currentYear + 5;

export const years: string[] = [];

for (let year = startYear; year <= endYear; year++) {
  years.push(year.toString());
}

export const months: string[] = [
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
