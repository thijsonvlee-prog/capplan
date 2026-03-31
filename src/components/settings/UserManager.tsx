"use client";

import { useState } from "react";
import Image from "next/image";
import { Shield, ShieldCheck, Eye } from "lucide-react";
import { useApiDataWithLoading, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { showToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { User } from "@/domain/types";

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Shield; className: string }> = {
  ADMIN: {
    label: "Admin",
    icon: ShieldCheck,
    className: "bg-brand-50 text-brand-700",
  },
  PLANNER: {
    label: "Planner",
    icon: Shield,
    className: "bg-success-50 text-success-700",
  },
  VIEWER: {
    label: "Kijker",
    icon: Eye,
    className: "bg-surface-tertiary text-text-secondary",
  },
};

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "PLANNER", label: "Planner" },
  { value: "VIEWER", label: "Kijker" },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function UserAvatar({ user }: { user: User }) {
  if (user.image) {
    return (
      <Image
        src={user.image}
        alt=""
        width={36}
        height={36}
        className="rounded-full"
        referrerPolicy="no-referrer"
      />
    );
  }

  const initial = (user.name ?? user.email ?? "?").charAt(0).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-semibold text-brand-700">{initial}</span>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.VIEWER;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

export function UserManager() {
  const [users, loading, error] = useApiDataWithLoading(() => api.users.list(), [], []);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [pendingChange, setPendingChange] = useState<{ user: User; newRole: string } | null>(null);

  function startRoleEdit(user: User) {
    setEditingUserId(user.id);
    setSelectedRole(user.role);
  }

  function cancelEdit() {
    setEditingUserId(null);
    setSelectedRole("");
  }

  function handleRoleSelect(user: User, newRole: string) {
    setSelectedRole(newRole);
    if (newRole !== user.role) {
      setPendingChange({ user, newRole });
    }
  }

  function confirmRoleChange() {
    if (!pendingChange) return;
    const { user, newRole } = pendingChange;
    mutate(() => api.users.updateRole(user.id, newRole))
      .then(() => {
        const roleLabel = ROLE_CONFIG[newRole]?.label ?? newRole;
        showToast(`Rol van ${user.name} gewijzigd naar ${roleLabel}`);
      })
      .catch(() => showToast("Er ging iets mis. Probeer het opnieuw.", "error"));
    setPendingChange(null);
    setEditingUserId(null);
    setSelectedRole("");
  }

  function cancelRoleChange() {
    setPendingChange(null);
    setSelectedRole(pendingChange?.user.role ?? "");
  }

  return (
    <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle">
      <div className="p-4 border-b border-border-subtle flex items-center justify-between">
        <div>
          <h3 className="text-section-title">Gebruikers</h3>
          <p className="text-caption mt-1">
            Gebruikers worden automatisch aangemaakt bij de eerste aanmelding via Google of Microsoft.
          </p>
        </div>
        {!loading && users.length > 0 && (
          <span className="count-badge">{users.length}</span>
        )}
      </div>

      <div className="divide-y divide-border-subtle">
        {loading && (
          <div className="p-8 flex justify-center">
            <div className="spinner" />
          </div>
        )}

        {!loading && error && users.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-sm font-medium text-danger-600">Fout bij ophalen gebruikers</div>
            <div className="text-xs text-text-tertiary mt-1">{error}</div>
          </div>
        )}

        {!loading && users.map((user) => (
          <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors">
            <UserAvatar user={user} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary truncate">
                  {user.name}
                </span>
              </div>
              <span className="text-xs text-text-tertiary truncate block">
                {user.email}
              </span>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <span className="text-xs text-text-tertiary">
                  Lid sinds {formatDate(user.createdAt)}
                </span>
              </div>

              {editingUserId === user.id ? (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleSelect(user, e.target.value)}
                    className="input-field text-xs py-1.5 pr-7"
                    autoFocus
                    onBlur={() => {
                      if (selectedRole === user.role) cancelEdit();
                    }}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <button
                  onClick={() => startRoleEdit(user)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  title="Klik om rol te wijzigen"
                  aria-label={`Rol wijzigen voor ${user.name}`}
                >
                  <RoleBadge role={user.role} />
                </button>
              )}
            </div>
          </div>
        ))}

        {!loading && users.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-text-secondary">Nog geen gebruikers.</p>
            <p className="text-xs text-text-tertiary mt-1">
              Gebruikers verschijnen hier zodra zij inloggen via Google of Microsoft.
            </p>
          </div>
        )}
      </div>

      {pendingChange && (
        <ConfirmDialog
          title="Rol wijzigen"
          message={`Weet je zeker dat je de rol van "${pendingChange.user.name}" wilt wijzigen naar ${ROLE_CONFIG[pendingChange.newRole]?.label ?? pendingChange.newRole}?`}
          onConfirm={confirmRoleChange}
          onCancel={cancelRoleChange}
        />
      )}
    </div>
  );
}
