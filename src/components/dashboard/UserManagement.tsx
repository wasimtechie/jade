"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { ROLE_LABELS, type Role } from "@/lib/auth/permissions";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashStatusChip } from "./form";
import { DashboardPanel } from "./DashboardPanel";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";
import { DashboardIconButton } from "./ui/DashboardIconButton";
import {
  UserFormModal,
  type ManagedUser,
  type UserFormValues,
} from "./UserFormModal";
import { PasswordResetModal } from "./PasswordResetModal";

function apiErrorMessage(
  data: { error?: string; details?: { fieldErrors?: Record<string, string[]> } },
  fallback: string,
): string {
  if (data.error && data.error !== "Validation failed") return data.error;
  const fields = data.details?.fieldErrors;
  if (fields) {
    const first = Object.values(fields).flat()[0];
    if (first) return first;
  }
  return data.error ?? fallback;
}

const ROLE_VARIANT: Record<Role, "accent" | "info" | "success" | "warning" | "danger"> = {
  admin: "accent",
  dev: "info",
  staff: "success",
  team: "warning",
  seo: "danger",
};

function fmtDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UserManagement() {
  const { data: session } = useSession();
  const myId = session?.user?.id;
  const canWrite = session?.user?.role === "admin";

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [meta, setMeta] = useState<
    Record<string, { lastLoginAt: string | null; createdAt: string | null }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState<
    { mode: "create" } | { mode: "edit"; user: ManagedUser } | null
  >(null);
  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null);

  const flash = useCallback((message: string) => {
    setSuccess(message);
    setError(null);
    window.setTimeout(() => setSuccess(null), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardFetch("/api/dashboard/users");
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "Failed to load users");
      }
      const data = (await res.json()) as {
        users: (ManagedUser & {
          lastLoginAt: string | null;
          createdAt: string | null;
        })[];
      };
      setUsers(data.users);
      const m: typeof meta = {};
      for (const u of data.users) {
        m[u.id] = { lastLoginAt: u.lastLoginAt, createdAt: u.createdAt };
      }
      setMeta(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createUser = useCallback(
    async (values: UserFormValues): Promise<string | null> => {
      const res = await dashboardFetch("/api/dashboard/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: { fieldErrors?: Record<string, string[]> };
      };
      if (!res.ok) return apiErrorMessage(data, "Failed to create user");
      flash("User created successfully");
      await load();
      return null;
    },
    [load, flash],
  );

  const editUser = useCallback(
    async (id: string, values: UserFormValues): Promise<string | null> => {
      const body: Record<string, unknown> = {
        name: values.name.trim(),
        role: values.role,
      };
      const pw = values.password.trim();
      if (pw) body.password = pw;
      const res = await dashboardFetch(`/api/dashboard/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: { fieldErrors?: Record<string, string[]> };
      };
      if (!res.ok) return apiErrorMessage(data, "Failed to update user");
      flash(pw ? "User updated and password changed" : "User updated successfully");
      await load();
      return null;
    },
    [load, flash],
  );

  const patch = useCallback(
    async (id: string, body: Record<string, unknown>) => {
      setBusyId(id);
      setError(null);
      try {
        const res = await dashboardFetch(`/api/dashboard/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          details?: { fieldErrors?: Record<string, string[]> };
        };
        if (!res.ok) throw new Error(apiErrorMessage(data, "Action failed"));
        const label =
          body.status === "suspended"
            ? "User suspended"
            : body.status === "active"
              ? "User activated"
              : body.password
                ? "Password updated"
                : "Changes saved";
        flash(label);
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Action failed");
      } finally {
        setBusyId(null);
      }
    },
    [load, flash],
  );

  const toggleStatus = async (u: ManagedUser) => {
    const next = u.status === "active" ? "suspended" : "active";
    const label = next === "suspended" ? "suspend" : "activate";
    if (
      !window.confirm(
        `${label.charAt(0).toUpperCase() + label.slice(1)} ${u.name}? ${
          next === "suspended"
            ? "They will not be able to sign in until reactivated."
            : "They will be able to sign in again."
        }`,
      )
    ) {
      return;
    }
    await patch(u.id, { status: next });
  };

  const removeUser = useCallback(
    async (u: ManagedUser) => {
      if (
        !window.confirm(
          `Permanently delete ${u.name} (${u.email})?\n\nThis removes the account from the database and cannot be undone.`,
        )
      ) {
        return;
      }
      setBusyId(u.id);
      setError(null);
      try {
        const res = await dashboardFetch(`/api/dashboard/users/${u.id}`, {
          method: "DELETE",
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Delete failed");
        flash(`${u.name} deleted permanently`);
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Delete failed");
      } finally {
        setBusyId(null);
      }
    },
    [load, flash],
  );

  const resetPassword = useCallback(
    async (u: ManagedUser, password: string): Promise<string | null> => {
      setBusyId(u.id);
      setError(null);
      try {
        const res = await dashboardFetch(`/api/dashboard/users/${u.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          details?: { fieldErrors?: Record<string, string[]> };
        };
        if (!res.ok) return apiErrorMessage(data, "Password reset failed");
        flash(`Password updated for ${u.name}`);
        await load();
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Password reset failed";
      } finally {
        setBusyId(null);
      }
    },
    [load, flash],
  );

  const columns: DataTableColumn<ManagedUser>[] = [
    {
      key: "name",
      header: "User",
      cell: (u) => (
        <div className="min-w-0">
          <p className="truncate font-bold text-white" title={u.name}>
            {u.name}
          </p>
          <p
            className="truncate text-[length:var(--fs-desc)] text-[color:var(--dash-text-secondary)]"
            title={u.email}
          >
            {u.email}
          </p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (u) => (
        <DashStatusChip variant={ROLE_VARIANT[u.role]}>
          {ROLE_LABELS[u.role]}
        </DashStatusChip>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (u) => (
        <DashStatusChip variant={u.status === "active" ? "success" : "warning"}>
          {u.status}
        </DashStatusChip>
      ),
    },
    {
      key: "lastLogin",
      header: "Last login",
      cell: (u) => (
        <span className="text-[length:var(--fs-desc)] text-[color:var(--dash-text-muted)]">
          {fmtDate(meta[u.id]?.lastLoginAt ?? null)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (u) => {
        if (!canWrite) {
          return <span className="text-[color:var(--dash-text-muted)]">Read-only</span>;
        }
        const isSelf = u.id === myId;
        const busy = busyId === u.id;
        return (
          <div className="flex items-center justify-end gap-1">
            {busy && <Loader2 className="h-4 w-4 animate-spin text-[color:var(--dash-text-muted)]" />}
            <DashboardIconButton
              label="Edit"
              variant="ghost"
              onClick={() => setModal({ mode: "edit", user: u })}
              className="text-[color:var(--dash-text-secondary)] hover:text-[var(--dash-accent)]"
              disabled={busy}
            >
              <Pencil className="h-4 w-4" />
            </DashboardIconButton>
            <DashboardIconButton
              label="Reset password"
              variant="ghost"
              onClick={() => setResetTarget(u)}
              className="text-[color:var(--dash-text-secondary)] hover:text-sky-300"
              disabled={busy}
            >
              <KeyRound className="h-4 w-4" />
            </DashboardIconButton>
            <DashboardIconButton
              label={u.status === "active" ? "Suspend" : "Activate"}
              variant="ghost"
              onClick={() => toggleStatus(u)}
              className="text-[color:var(--dash-text-secondary)] hover:text-amber-300 disabled:opacity-30"
              disabled={busy || isSelf}
            >
              {u.status === "active" ? (
                <UserX className="h-4 w-4" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
            </DashboardIconButton>
            <DashboardIconButton
              label="Delete permanently"
              variant="ghost"
              onClick={() => removeUser(u)}
              className="text-[color:var(--dash-text-secondary)] hover:text-red-400 disabled:opacity-30"
              disabled={busy || isSelf}
            >
              <Trash2 className="h-4 w-4" />
            </DashboardIconButton>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DashboardModuleFrame
        toolbar={
          <DashboardListToolbar
            meta={`${users.length} user${users.length === 1 ? "" : "s"}`}
            onRefresh={load}
            refreshing={loading}
          >
            {canWrite && (
              <div className={dash.toolbarSegment}>
                <button
                  type="button"
                  onClick={() => setModal({ mode: "create" })}
                  className={`${dash.btn} ${dash.btnAccent}`}
                >
                  <Plus className="h-4 w-4" />
                  New user
                </button>
              </div>
            )}
          </DashboardListToolbar>
        }
        success={success}
        error={error}
        loading={loading}
        loadingLabel="Loading users…"
      >
        <DataTable
          columns={columns}
          rows={users}
          rowKey={(u) => u.id}
          emptyMessage="No staff accounts yet. Seed defaults with npm run db:seed:users or create one."
          caption="Staff accounts"
          stickyFirstColumn
          dense
        />
      </DashboardModuleFrame>

      <DashboardPanel pad>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--dash-accent)]" />
          <p className={dash.muted}>
            Permissions are enforced on the backend per role. View the full
            access matrix under{" "}
            <a
              href="/dashboard/staff/roles"
              className="text-[var(--dash-accent)] underline-offset-2 hover:underline"
            >
              Roles &amp; Permissions
            </a>
            .
          </p>
        </div>
      </DashboardPanel>

      {modal && (
        <UserFormModal
          mode={modal.mode}
          initial={modal.mode === "edit" ? modal.user : null}
          onClose={() => setModal(null)}
          onSubmit={(values) =>
            modal.mode === "create"
              ? createUser(values)
              : editUser(modal.user.id, values)
          }
        />
      )}

      {resetTarget && (
        <PasswordResetModal
          userName={resetTarget.name}
          userEmail={resetTarget.email}
          onClose={() => setResetTarget(null)}
          onSubmit={(password) => resetPassword(resetTarget, password)}
        />
      )}
    </>
  );
}
