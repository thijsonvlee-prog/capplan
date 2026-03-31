"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Building2,
  ChevronDown,
  ChevronRight,
  X,
  UserPlus,
  UserMinus,
} from "lucide-react";
import Image from "next/image";
import { useApiDataWithLoading, mutate } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { showToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { UserGroup, UserGroupMember, StamtabelRecord, User } from "@/domain/types";

// === Sub-components ===

function MemberAvatar({ name, image }: { name: string; image?: string | null }) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={28}
        height={28}
        className="rounded-full flex-shrink-0"
        referrerPolicy="no-referrer"
      />
    );
  }
  const initial = (name ?? "?").charAt(0).toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-semibold text-brand-700">{initial}</span>
    </div>
  );
}

function DepartmentTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-tertiary text-xs text-text-secondary font-medium">
      <Building2 className="w-3 h-3 text-text-tertiary" />
      {label}
    </span>
  );
}

// === Group Card (collapsed view) ===

function GroupCard({
  group,
  departmentMap,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  group: UserGroup;
  departmentMap: Map<string, string>;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const departmentLabels = group.departmentIds
    .map((id) => departmentMap.get(id))
    .filter(Boolean) as string[];

  return (
    <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-surface-secondary transition-colors"
        onClick={onToggle}
        role="button"
        aria-expanded={isExpanded}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
      >
        <div className="flex-shrink-0 text-text-tertiary">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>

        <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
          <Users className="w-4.5 h-4.5 text-brand-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-text-primary">{group.name}</h4>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-text-tertiary flex items-center gap-1">
              <Users className="w-3 h-3" />
              {group.memberCount} {group.memberCount === 1 ? "lid" : "leden"}
            </span>
            <span className="text-xs text-text-tertiary flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {group.departmentIds.length} {group.departmentIds.length === 1 ? "afdeling" : "afdelingen"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="btn-icon" aria-label={`${group.name} bewerken`}>
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="btn-icon-danger" aria-label={`${group.name} verwijderen`}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border-subtle">
          {/* Departments section */}
          <div className="px-4 py-3 border-b border-border-subtle">
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Afdelingen</span>
            {departmentLabels.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {departmentLabels.map((label) => (
                  <DepartmentTag key={label} label={label} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-tertiary mt-1.5">Geen afdelingen gekoppeld.</p>
            )}
          </div>

          {/* Members section */}
          <div className="px-4 py-3">
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Leden</span>
            {group.members && group.members.length > 0 ? (
              <div className="space-y-2 mt-2">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2.5">
                    <MemberAvatar name={member.name} />
                    <div className="min-w-0">
                      <span className="text-sm text-text-primary block truncate">{member.name}</span>
                      <span className="text-xs text-text-tertiary block truncate">{member.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-tertiary mt-1.5">Geen leden in deze groep.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// === Department multi-select ===

function DepartmentMultiSelect({
  departments,
  selectedIds,
  onChange,
}: {
  departments: StamtabelRecord[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  function toggle(id: string) {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  if (departments.length === 0) {
    return <p className="text-xs text-text-tertiary">Geen afdelingen beschikbaar. Voeg afdelingen toe via Stamgegevens.</p>;
  }

  return (
    <div className="max-h-48 overflow-y-auto space-y-0.5 rounded-md border border-border-subtle bg-surface-secondary p-1.5">
      {departments.map((dept) => (
        <label
          key={dept.id}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-surface-tertiary cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            checked={selectedSet.has(dept.id)}
            onChange={() => toggle(dept.id)}
            className="w-3.5 h-3.5 rounded border-border-default text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
          />
          <span className="text-sm text-text-primary">{dept.description}</span>
          <span className="text-xs text-text-tertiary ml-auto">{dept.code}</span>
        </label>
      ))}
    </div>
  );
}

// === Member assignment ===

function MemberAssignment({
  users,
  groupId,
  currentMembers,
  onAssign,
  onUnassign,
}: {
  users: User[];
  groupId: string;
  currentMembers: UserGroupMember[];
  onAssign: (userId: string) => void;
  onUnassign: (userId: string) => void;
}) {
  const memberIds = useMemo(() => new Set(currentMembers.map((m) => m.id)), [currentMembers]);

  // Split users: members of this group vs available (not in any group, or in another group)
  const assignedUsers = useMemo(
    () => users.filter((u) => memberIds.has(u.id)),
    [users, memberIds]
  );
  const availableUsers = useMemo(
    () => users.filter((u) => !memberIds.has(u.id) && (!u.userGroupId || u.userGroupId === groupId)),
    [users, memberIds, groupId]
  );
  const inOtherGroup = useMemo(
    () => users.filter((u) => !memberIds.has(u.id) && u.userGroupId && u.userGroupId !== groupId),
    [users, memberIds, groupId]
  );

  return (
    <div className="space-y-3">
      {/* Current members */}
      {assignedUsers.length > 0 && (
        <div>
          <span className="text-xs font-medium text-text-tertiary">Huidige leden</span>
          <div className="mt-1.5 space-y-1">
            {assignedUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md bg-success-50">
                <MemberAvatar name={user.name} image={user.image} />
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-text-primary truncate block">{user.name}</span>
                  <span className="text-xs text-text-tertiary truncate block">{user.email}</span>
                </div>
                <button
                  onClick={() => onUnassign(user.id)}
                  className="p-1 text-text-tertiary hover:text-danger-600 hover:bg-danger-50 rounded-md transition-colors flex-shrink-0"
                  aria-label={`${user.name} verwijderen uit groep`}
                  title="Verwijderen uit groep"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available users */}
      {availableUsers.length > 0 && (
        <div>
          <span className="text-xs font-medium text-text-tertiary">Beschikbare gebruikers</span>
          <div className="mt-1.5 space-y-1">
            {availableUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-surface-tertiary transition-colors">
                <MemberAvatar name={user.name} image={user.image} />
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-text-primary truncate block">{user.name}</span>
                  <span className="text-xs text-text-tertiary truncate block">{user.email}</span>
                </div>
                <button
                  onClick={() => onAssign(user.id)}
                  className="p-1 text-text-tertiary hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors flex-shrink-0"
                  aria-label={`${user.name} toevoegen aan groep`}
                  title="Toevoegen aan groep"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users in other groups */}
      {inOtherGroup.length > 0 && (
        <div>
          <span className="text-xs font-medium text-text-tertiary">In andere groep</span>
          <div className="mt-1.5 space-y-1">
            {inOtherGroup.map((user) => (
              <div key={user.id} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md opacity-50">
                <MemberAvatar name={user.name} image={user.image} />
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-text-primary truncate block">{user.name}</span>
                  <span className="text-xs text-text-tertiary truncate block">{user.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {users.length === 0 && (
        <p className="text-xs text-text-tertiary">Geen gebruikers beschikbaar.</p>
      )}
    </div>
  );
}

// === Group editor (modal) ===

function GroupEditor({
  group,
  departments,
  users,
  onSave,
  onCancel,
}: {
  group: { name: string; departmentIds: string[]; members: UserGroupMember[] } | null;
  departments: StamtabelRecord[];
  users: User[];
  onSave: (name: string, departmentIds: string[], addUserIds: string[], removeUserIds: string[]) => void;
  onCancel: () => void;
}) {
  const isNew = group === null;
  const [name, setName] = useState(group?.name ?? "");
  const [departmentIds, setDepartmentIds] = useState<string[]>(group?.departmentIds ?? []);
  const [memberIdsList, setMemberIdsList] = useState<string[]>(
    group?.members.map((m) => m.id) ?? []
  );
  const memberIds = useMemo(() => new Set(memberIdsList), [memberIdsList]);
  const [showValidation, setShowValidation] = useState(false);

  const originalMemberIds = useMemo(
    () => new Set(group?.members.map((m) => m.id) ?? []),
    [group]
  );

  const currentMembers: UserGroupMember[] = useMemo(
    () => users.filter((u) => memberIds.has(u.id)).map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
    [users, memberIds]
  );

  function handleAssign(userId: string) {
    setMemberIdsList((prev) => prev.includes(userId) ? prev : [...prev, userId]);
  }

  function handleUnassign(userId: string) {
    setMemberIdsList((prev) => prev.filter((id) => id !== userId));
  }

  function handleSave() {
    if (!name.trim()) {
      setShowValidation(true);
      return;
    }

    const addUserIds = Array.from(memberIds).filter((id) => !originalMemberIds.has(id));
    const removeUserIds = Array.from(originalMemberIds).filter((id) => !memberIds.has(id));

    onSave(name.trim(), departmentIds, addUserIds, removeUserIds);
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 overflow-y-auto py-8"
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? "Nieuwe gebruikersgroep" : "Gebruikersgroep bewerken"}
      onClick={onCancel}
    >
      <div
        className="bg-surface-primary rounded-lg shadow-modal w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <h3 className="text-section-title">
            {isNew ? "Nieuwe gebruikersgroep" : "Groep bewerken"}
          </h3>
          <button onClick={onCancel} className="btn-icon" aria-label="Sluiten">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Name */}
          <div>
            <label className="form-label">Naam *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setShowValidation(false); }}
              placeholder="Bijv. Regio Noord"
              className="input-field w-full"
              autoFocus
            />
            {showValidation && !name.trim() && (
              <p className="text-xs text-danger-600 mt-1">Vul een groepsnaam in.</p>
            )}
          </div>

          {/* Departments */}
          <div>
            <label className="form-label">Afdelingen</label>
            <p className="text-xs text-text-tertiary mb-2">
              Leden van deze groep zien alleen chauffeurs en planning van de geselecteerde afdelingen.
            </p>
            <DepartmentMultiSelect
              departments={departments}
              selectedIds={departmentIds}
              onChange={setDepartmentIds}
            />
          </div>

          {/* Members */}
          {!isNew && (
            <div>
              <label className="form-label">Leden</label>
              <p className="text-xs text-text-tertiary mb-2">
                Wijs gebruikers toe aan deze groep. Elke gebruiker kan in maximaal één groep zitten.
              </p>
              <MemberAssignment
                users={users}
                groupId=""
                currentMembers={currentMembers}
                onAssign={handleAssign}
                onUnassign={handleUnassign}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-5 border-t border-border-subtle">
          <button onClick={onCancel} className="btn-secondary">
            Annuleren
          </button>
          <button onClick={handleSave} className="btn-primary">
            {isNew ? "Aanmaken" : "Opslaan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// === Main component ===

export function UserGroupManager() {
  const [groups, groupsLoading, groupsError] = useApiDataWithLoading(() => api.userGroups.list(), [], []);
  const [departments] = useApiDataWithLoading(() => api.settings.getDepartments(), [], []);
  const [users] = useApiDataWithLoading(() => api.users.list(), [], []);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<UserGroup | null>(null);
  const [editingGroup, setEditingGroup] = useState<
    { id: string | null; name: string; departmentIds: string[]; members: UserGroupMember[] } | "new" | null
  >(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const departmentMap = useMemo(
    () => new Map(departments.map((d) => [d.id, `${d.description} (${d.code})`])),
    [departments]
  );

  // Fetch expanded group details (includes members)
  const handleToggleExpand = useCallback(async (groupId: string) => {
    if (expandedId === groupId) {
      setExpandedId(null);
      setExpandedGroup(null);
      return;
    }
    setExpandedId(groupId);
    try {
      const detail = await api.userGroups.get(groupId);
      setExpandedGroup(detail);
    } catch {
      showToast("Kan groepsdetails niet ophalen.", "error");
    }
  }, [expandedId]);

  function handleStartCreate() {
    setEditingGroup("new");
  }

  async function handleStartEdit(group: UserGroup) {
    try {
      const detail = await api.userGroups.get(group.id);
      setEditingGroup({
        id: group.id,
        name: detail.name,
        departmentIds: detail.departmentIds,
        members: detail.members ?? [],
      });
    } catch {
      showToast("Kan groepsdetails niet ophalen.", "error");
    }
  }

  async function handleSave(
    name: string,
    departmentIds: string[],
    addUserIds: string[],
    removeUserIds: string[]
  ) {
    const isNew = editingGroup === "new";
    try {
      if (isNew) {
        await mutate(() => api.userGroups.create(name, departmentIds));
        showToast("Gebruikersgroep aangemaakt");
      } else if (editingGroup && typeof editingGroup === "object") {
        const groupId = editingGroup.id!;
        await mutate(() => api.userGroups.update(groupId, name, departmentIds));

        // Assign new members
        for (const userId of addUserIds) {
          await mutate(() => api.users.updateGroup(userId, groupId));
        }
        // Unassign removed members
        for (const userId of removeUserIds) {
          await mutate(() => api.users.updateGroup(userId, null));
        }

        showToast("Gebruikersgroep bijgewerkt");
      }
      setEditingGroup(null);
      setExpandedId(null);
      setExpandedGroup(null);
    } catch {
      showToast("Er ging iets mis. Probeer het opnieuw.", "error");
    }
  }

  function handleDelete(group: UserGroup) {
    setPendingDelete({ id: group.id, name: group.name });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await mutate(() => api.userGroups.delete(pendingDelete.id));
      showToast("Gebruikersgroep verwijderd");
      if (expandedId === pendingDelete.id) {
        setExpandedId(null);
        setExpandedGroup(null);
      }
    } catch {
      showToast("Er ging iets mis. Probeer het opnieuw.", "error");
    }
    setPendingDelete(null);
  }

  // Build group list with expanded group detail merged in
  const displayGroups = useMemo(() => {
    return groups.map((g) => {
      if (g.id === expandedId && expandedGroup) {
        return { ...g, members: expandedGroup.members };
      }
      return g;
    });
  }, [groups, expandedId, expandedGroup]);

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!groupsLoading && groups.length > 0 && (
            <span className="text-xs text-text-tertiary">
              {groups.length} {groups.length === 1 ? "groep" : "groepen"}
            </span>
          )}
        </div>
        <button onClick={handleStartCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nieuwe groep
        </button>
      </div>

      {/* Loading */}
      {groupsLoading && (
        <div className="p-8 flex justify-center">
          <div className="spinner" />
        </div>
      )}

      {/* Error */}
      {!groupsLoading && groupsError && groups.length === 0 && (
        <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle p-8 text-center">
          <div className="text-sm font-medium text-danger-600">Fout bij ophalen gebruikersgroepen</div>
          <div className="text-xs text-text-tertiary mt-1">{groupsError}</div>
        </div>
      )}

      {/* Groups list */}
      {!groupsLoading && displayGroups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          departmentMap={departmentMap}
          isExpanded={expandedId === group.id}
          onToggle={() => handleToggleExpand(group.id)}
          onEdit={() => handleStartEdit(group)}
          onDelete={() => handleDelete(group)}
        />
      ))}

      {/* Empty state */}
      {!groupsLoading && groups.length === 0 && (
        <div className="bg-surface-primary rounded-lg shadow-card border border-border-subtle p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-brand-600" />
          </div>
          <p className="text-sm text-text-primary font-medium">Nog geen gebruikersgroepen</p>
          <p className="text-xs text-text-tertiary mt-1 max-w-sm mx-auto">
            Maak een groep aan om gebruikers te koppelen aan specifieke afdelingen. Leden van een groep zien alleen de chauffeurs en planning van hun afdelingen.
          </p>
        </div>
      )}

      {/* Editor modal */}
      {editingGroup !== null && (
        <GroupEditor
          group={editingGroup === "new" ? null : editingGroup}
          departments={departments}
          users={users}
          onSave={handleSave}
          onCancel={() => setEditingGroup(null)}
        />
      )}

      {/* Delete confirmation */}
      {pendingDelete && (
        <ConfirmDialog
          title="Groep verwijderen"
          message={`Weet je zeker dat je "${pendingDelete.name}" wilt verwijderen? Leden van deze groep worden losgekoppeld maar niet verwijderd.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
