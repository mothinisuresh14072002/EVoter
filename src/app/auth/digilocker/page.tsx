import { redirect } from "next/navigation";

export default function LegacyDigiLockerRoute() {
  redirect("/auth/demo");
}
