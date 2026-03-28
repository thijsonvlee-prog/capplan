"use client";

import { ExternalHireList } from "@/components/external-hires/ExternalHireList";

export default function ExternalHiresPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Inhuur</h2>
      <p className="text-gray-500 mb-4">
        Beheer charter en uitzendkracht chauffeurs
      </p>
      <ExternalHireList />
    </div>
  );
}
