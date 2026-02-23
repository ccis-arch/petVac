import React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { locations } from "@/data/barangayData";

import { icon } from "leaflet";

interface LeafletComponentProps {
  position: [number, number];
  onLocationClick: (location: string) => void;
  totalVaccinatedPets: { [key: string]: number };
  totalDistributedVaccines: number;
  totalPetOwnersRegistered: { [key: string]: number };
  height?: string;
}

const LeafletComponent: React.FC<LeafletComponentProps> = ({
  position,
  onLocationClick,
  totalVaccinatedPets = {},
  totalDistributedVaccines,
  totalPetOwnersRegistered = {},
  height,
}) => {
  const limeOptions = { color: "lime" };

  const locationPositions: { [key: string]: [number, number] } = {
    bunawanBrook: [8.238061252629004, 126.10680206848212],
    consuelo: [8.261747821295813, 125.99310792830387],
    imelda: [8.123157334384759, 126.08076582776197],
    libertad: [8.120630342869381, 126.03211461599722],
    mambalili: [8.220950283239883, 125.94097396356905],
    nuevaEra: [8.177018816736688, 125.92263470134232],
    poblacion: [8.187226428490126, 125.96876056701245],
    sanAndres: [8.254567349864514, 126.06134677289799],
    sanMarcos: [8.264706507278717, 125.92190790272774],
    sanTeodoro: [8.166596100414846, 125.98157592074891],
  };

  function toCamelCase(str: string) {
    return str
      .replace(/\s(.)/g, function ($1) {
        return $1.toUpperCase();
      })
      .replace(/\s/g, "")
      .replace(/^(.)/, function ($1) {
        return $1.toLowerCase();
      });
  }

  let multiPolygon = Object.values(locationPositions);

  multiPolygon = [...multiPolygon, multiPolygon[0]];

  const ICON = icon({
    iconUrl: "/pet-vax-logo-no-text.svg",
    iconSize: [45, 45],
  });

  return (
    <div
      className={`z-0 bg-white shadow-lg flex justify-between rounded-xl px-5 py-7 ${
        height ? `h-${height}` : "h-[430px]"
      }`}>
      <MapContainer center={position} zoom={12} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => {
          const key = toCamelCase(location);
          const position = locationPositions[key];
          const vaccinatedPets = totalVaccinatedPets[location] || 0;
          const petOwners = totalPetOwnersRegistered[location] || 0;
          return position ? (
            <Marker
              key={location}
              position={position}
              icon={ICON}
              eventHandlers={{
                click: () => onLocationClick(location),
              }}>
              <Popup>
                <h2 className="font-semibold text-lg text-green-700">
                  {location}
                </h2>
                <h3 className="font-semibold">
                  No. of Vaccinated Pets:{" "}
                  <span className="font-normal">{vaccinatedPets}</span>
                </h3>
                <h3 className="font-semibold">
                  No. of Distributed Vaccines:{" "}
                  <span className="font-normal">{vaccinatedPets}</span>
                </h3>
                <h3 className="font-semibold">
                  No. of Pet Owners Registered:{" "}
                  <span className="font-normal">{petOwners}</span>
                </h3>
              </Popup>
            </Marker>
          ) : null;
        })}
      </MapContainer>
    </div>
  );
};

export default LeafletComponent;
