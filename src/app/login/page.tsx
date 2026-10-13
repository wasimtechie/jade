"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, getSession, useSession } from "next-auth/react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { DashFloatingField } from "@/components/dashboard/form";
import {
  ROLE_LOGIN_CONFIG,
} from "@/lib/auth/roleConfig";
import type { Role } from "@/lib/auth/permissions";
import { resolvePostLoginPath } from "@/lib/auth/permissions";
import type { LoginFailureCode } from "@/lib/auth/loginMessages";
import { LOGIN_FAILURE_MESSAGES } from "@/lib/auth/loginMessages";
import {
  useDashboardForm,
  validateLogin,
} from "@/lib/dashboard/dashboardFormValidation";

function LoginForm() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  const [email, setEmail] = useState(ROLE_LOGIN_CONFIG[0].email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<LoginFailureCode | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    fieldErrors,
    showFieldError,
    touch,
    validateField,
    runSubmit,
  } = useDashboardForm({
    validate: validateLogin,
  });

  const getValues = () => ({
    email: email.trim().toLowerCase(),
    password,
  });

  const blur = (key: "email" | "password") => {
    touch(key);
    validateField(key, getValues());
  };

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "forbidden") {
      setError("Your account cannot access that page. Sign in again.");
      setErrorCode(null);
    } else if (err === "suspended") {
      setError(LOGIN_FAILURE_MESSAGES.ACCOUNT_SUSPENDED);
      setErrorCode("ACCOUNT_SUSPENDED");
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated" && session?.user?.role) {
      const dest = resolvePostLoginPath(
        session.user.role,
        searchParams.get("next"),
      );
      if (dest !== "/login") {
        window.location.replace(dest);
      }
    }
  }, [status, session?.user?.role, searchParams]);

  useEffect(() => {
    const config = ROLE_LOGIN_CONFIG.find((r) => r.role === selectedRole);
    if (config) {
      document.title = `Jade Host — ${config.label} Sign In`;
    }
  }, [selectedRole]);

  useEffect(() => {
    const config = ROLE_LOGIN_CONFIG.find((r) => r.role === selectedRole);
    if (config) setEmail(config.email);
  }, [selectedRole]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setError("");
    setErrorCode(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const values = getValues();
    if (!runSubmit(values)) {
      setError("");
      setErrorCode(null);
      return;
    }

    setLoading(true);
    setError("");
    setErrorCode(null);

    const normalizedEmail = values.email;

    try {
      const checkRes = await fetch("/api/auth/login-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password: values.password,
          role: selectedRole,
        }),
      });
      const check = (await checkRes.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        code?: keyof typeof LOGIN_FAILURE_MESSAGES;
      };

      if (!checkRes.ok || !check.ok) {
        const code = check.code ?? "INVALID_CREDENTIALS";
        setErrorCode(code);
        setError(check.message ?? LOGIN_FAILURE_MESSAGES[code]);
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password: values.password,
        role: selectedRole,
        redirect: false,
      });

      if (result?.ok) {
        const fresh = await getSession();
        const role = fresh?.user?.role ?? selectedRole;
        const dest = resolvePostLoginPath(role, searchParams.get("next"));
        window.location.assign(dest);
        return;
      }

      setError("Sign-in could not be completed. Please try again.");
    } catch {
      setError("Unable to reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeConfig = ROLE_LOGIN_CONFIG.find((r) => r.role === selectedRole);

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="w-full text-center">
        <h1 className="font-philosopher text-[length:var(--fs-h1)] text-white">
          Jade Host
        </h1>
        <p className="font-manrope text-[length:var(--fs-label)] uppercase tracking-[0.25em] text-[#EFCD62]">
          {activeConfig?.label ?? "Staff"} sign in
        </p>
        {activeConfig && (
          <p className="mt-2 font-manrope text-[length:var(--fs-desc)] text-white/45">
            {activeConfig.description}
          </p>
        )}
      </div>

      <div className="w-full">
        <p className="mb-2 font-manrope text-[length:var(--fs-label)] font-bold uppercase tracking-widest text-[#EFCD62]">
          Select role
        </p>
        <div className="login-role-grid">
          {ROLE_LOGIN_CONFIG.map((item) => {
            const active = selectedRole === item.role;
            return (
              <button
                key={item.role}
                type="button"
                onClick={() => handleRoleSelect(item.role)}
                className={`min-h-[44px] w-full border px-2 py-2 font-manrope text-xs font-bold uppercase tracking-wider transition-colors ${
                  active
                    ? "border-[#EFCD62] bg-[#EFCD62]/15 text-[#EFCD62]"
                    : "border-white/15 bg-black/20 text-white/55 hover:border-white/30 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        {activeConfig && (
          <p className="mt-2 font-manrope text-[length:var(--fs-desc)] text-white/45">
            Account:{" "}
            <span className="text-white/70">{activeConfig.email}</span>
          </p>
        )}
      </div>

      <div className="dash-login-card w-full">
        <div className="space-y-4">
          <div>
            <p className="dash-login-card__title">Credentials</p>
            <p className="dash-login-card__subtitle">
              Sign in with your staff email and password
            </p>
          </div>
          <DashFloatingField
            id="email"
            label="Email ID"
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={() => blur("email")}
            autoComplete="username"
            invalid={Boolean(fieldErrors.email)}
            showError={showFieldError("email")}
            errorMessage={fieldErrors.email}
            required
          />
          <DashFloatingField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            onBlur={() => blur("password")}
            autoComplete="current-password"
            invalid={Boolean(fieldErrors.password)}
            showError={showFieldError("password")}
            errorMessage={fieldErrors.password}
            required
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className={`flex items-center gap-2 font-manrope text-[length:var(--fs-body)] ${
            errorCode === "ACCOUNT_SUSPENDED"
              ? "text-amber-300"
              : "text-red-400"
          }`}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full min-h-[48px] font-manrope text-sm font-bold uppercase tracking-widest transition-colors ${
          loading
            ? "cursor-not-allowed bg-white/10 text-white/30"
            : "bg-[#EFCD62] text-[#1A1C1E] hover:bg-white"
        }`}
      >
        {loading ? (
          <Loader2
            className="mx-auto h-5 w-5 animate-spin"
            aria-label="Signing in"
          />
        ) : (
          `Sign in as ${activeConfig?.label ?? "Staff"}`
        )}
      </button>

      {process.env.NODE_ENV === "development" && (
        <div className="w-full rounded-none border border-white/10 bg-white/5 px-4 py-3 text-left">
          <p className="font-manrope text-[length:var(--fs-label)] font-bold uppercase tracking-widest text-white/50">
            Dev setup
          </p>
          <p className="mt-1 font-manrope text-[length:var(--fs-desc)] text-white/40">
            Run{" "}
            <code className="text-[#EFCD62]/80">npm run db:seed:users</code> after
            MongoDB is connected. See{" "}
            <code className="text-white/60">DEPLOYMENT.md</code> for seed
            credentials (not shown here in production builds).
          </p>
        </div>
      )}
    </form>
  );
}

export default function LoginPage() {
  return (
    <div
      className="login-page flex min-h-[100dvh] items-center justify-center px-4"
      style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 1rem)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 1rem)",
      }}
    >
      <Suspense
        fallback={
          <p className="font-manrope text-sm text-white/50">Loading…</p>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
