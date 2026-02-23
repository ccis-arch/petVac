import { ReactNode } from "react";

export interface PetOwner {
  barangay: string | null;
  birth_date: string;
  date_registered: string;
  first_name: string;
  gender: string;
  id: string;
  last_name: string;
  phone_number: string;
  // status: string;
}

export interface Event {
  allDay: boolean;
  end_date: string;
  end_time: string;
  id: number;
  location: string;
  note: string;
  start_date: string;
  start_time: string;
  title: string;
}

export interface VMSRecord {
  id: string;
  batch_number: string;
  name: string;
  stockin_date: string;
  expiration_date: string;
  original_qty: number | string;
  remaining_qty: number | string;
  status: string;
  last_modified: string;
}

export interface NavigationProps {
  children: ReactNode;
}

export interface SidebarProps {
  isMenuOpen: boolean;
  handleMenuClick: () => void;
}

export interface Button {
  path: string;
  label: string;
  icon: JSX.Element;
}

export interface TopbarProps {
  isMenuOpen: boolean;
  handleMenuClick: () => void;
}

export interface MenuButtonProps {
  onClick: () => void;
  isMenuOpen: boolean;
}

export interface Pet {
  date_vaccinated: Date | null;
  specie: "" | "cat" | "dog" | undefined;
  sex: string;
  breed: string | null;
  birth_date: string;
  weight: number | null;
  color: string | null;
  pet_origin: string;
  ownership: string | null;
  habitat: string | null;
  tag: string | null;
  is_pregnant: string | boolean | null;
  is_lactating_with_puppies: string | boolean | null;
  num_puppies: string | number | null;

  id: string;
  owner_id: string;
  pet_name: string;
  PetOwnerProfiles: {
    first_name: string;
    last_name: string;
    barangay: string;
  };
  status: string;
}

export interface PetCount {
  owner_id: string;
  pet_count: number;
}
