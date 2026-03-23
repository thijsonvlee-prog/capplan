"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        {session?.user && (
          <>
            <span className="text-sm text-gray-600">
              {session.user.name || session.user.email}
              <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                {session.user.role}
              </span>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Uitloggen"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
