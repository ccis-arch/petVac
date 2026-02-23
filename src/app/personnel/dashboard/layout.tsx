import Navigation from "@/components/Navigation";
import Protected from "@/utils/Protected";
import { Suspense } from "react";

export const metadata = {
  title: "Dashboard | Pet Vaccination System",
  description: "Pet Vaccination System",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected>
      {/* <Suspense fallback={<div>Loading...</div>}> */}
      <Navigation>{children}</Navigation>
      {/* </Suspense> */}
    </Protected>
  );
}
