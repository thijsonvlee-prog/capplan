import { HoursImport } from "@/components/hours/HoursImport";

export default function HoursPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gerealiseerde Uren</h2>
      <HoursImport />
    </div>
  );
}
