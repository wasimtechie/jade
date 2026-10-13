"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ExternalLink, X } from "lucide-react";
import { ROLE_LOGIN_CONFIG } from "@/lib/auth/roleConfig";
import type { Role } from "@/lib/auth/permissions";
import { canAccess } from "@/lib/auth/permissions";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DASHBOARD_BRAND, DASHBOARD_NAV, type NavItem } from "./navConfig";
import { DashboardIconButton } from "./ui/DashboardIconButton";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  role: Role;
  userName?: string;
  userEmail?: string | null;
};

function filterNavByRole(role: Role): NavItem[] {
  return DASHBOARD_NAV.filter(
    (item) => canAccess(item.href, role) !== "none",
  );
}

function groupNav(items: NavItem[]): { section: string; items: NavItem[] }[] {
  const sections = new Map<string, NavItem[]>();
  for (const item of items) {
    const key = item.section ?? "General";
    const list = sections.get(key) ?? [];
    list.push(item);
    sections.set(key, list);
  }
  return Array.from(sections.entries()).map(([section, navItems]) => ({
    section,
    items: navItems,
  }));
}

function roleLabel(role: Role): string {
  return ROLE_LOGIN_CONFIG.find((r) => r.role === role)?.label ?? role;
}

function userInitials(name: string, email?: string | null): string {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={active ? dash.sidebarLinkActive : dash.sidebarLink}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <span className={dash.sidebarLinkActiveBar} aria-hidden />
      )}
      <span className={dash.sidebarLinkIcon} aria-hidden>
        <Icon className="h-4 w-4" />
      </span>
      <span className={dash.sidebarLinkLabel}>{item.label}</span>
    </Link>
  );
}

function SidebarInner({
  groups,
  isActive,
  onNavigate,
  userName,
  userEmail,
  role,
  onClose,
  showClose,
}: {
  groups: ReturnType<typeof groupNav>;
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
  userName?: string;
  userEmail?: string | null;
  role: Role;
  onClose: () => void;
  showClose: boolean;
}) {
  return (
    <>
      <div className={dash.sidebarBrand}>
        <div className={dash.sidebarBrandRow}>
          <div className="flex min-w-0 items-center gap-3">
            <span className={dash.sidebarLogo} aria-hidden>
              <Image
                src="/assets/Golden_Logo.png"
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 object-contain"
              />
            </span>
            <div className="min-w-0">
              <p className="truncate font-philosopher text-base leading-tight text-[var(--dash-text)]">
                {DASHBOARD_BRAND.title}
              </p>
              <p className={`${dash.label} text-[0.625rem] tracking-[0.14em]`}>
                {DASHBOARD_BRAND.subtitle}
              </p>
            </div>
          </div>
          {showClose && (
            <DashboardIconButton
              label="Close navigation"
              onClick={onClose}
              variant="ghost"
              size="compact"
            >
              <X className="h-5 w-5" />
            </DashboardIconButton>
          )}
        </div>

        {userName && (
          <div className={`${dash.user} mt-4 ${dash.onlyMobile}`}>
            <span className={dash.userAvatar}>
              {userInitials(userName, userEmail)}
            </span>
            <div className="min-w-0">
              <p className={dash.userName}>{userName}</p>
              <p className={dash.userRole}>{roleLabel(role)}</p>
            </div>
          </div>
        )}
      </div>

      <nav className={dash.sidebarNav}>
        {groups.map(({ section, items }) => (
          <div key={section} className={dash.sidebarSection}>
            <p className={dash.sidebarSectionLabel}>{section}</p>
            {items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item.href)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className={dash.sidebarFooter}>
        {userName && (
          <div className={`${dash.sidebarUserCard} ${dash.onlyDesktop}`}>
            <span className={dash.userAvatar}>
              {userInitials(userName, userEmail)}
            </span>
            <div className="min-w-0">
              <p className={dash.userName}>{userName}</p>
              <p className={dash.userRole}>{roleLabel(role)}</p>
            </div>
          </div>
        )}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={dash.sidebarViewSite}
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          View website
        </Link>
      </div>
    </>
  );
}

export function Sidebar({
  open,
  onClose,
  role,
  userName,
  userEmail,
}: SidebarProps) {
  const pathname = usePathname();
  const groups = groupNav(filterNavByRole(role));
  const mobileAsideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const aside = mobileAsideRef.current;
    const focusable = aside?.querySelector<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    focusable?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <div
        className={open ? dash.overlayVisible : dash.overlay}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        ref={mobileAsideRef}
        className={open ? dash.sidebarMobileOpen : dash.sidebarMobile}
        aria-label="Dashboard navigation"
        aria-hidden={!open}
      >
        <div className={dash.sidebarFrame}>
          <div className={dash.sidebarGlassFill}>
            <SidebarInner
              groups={groups}
              isActive={isActive}
              onNavigate={onClose}
              userName={userName}
              userEmail={userEmail}
              role={role}
              onClose={onClose}
              showClose
            />
          </div>
        </div>
      </aside>

      <aside className={dash.sidebarDesktop} aria-label="Dashboard navigation">
        <div className={dash.sidebarFrame}>
          <div className={dash.sidebarGlassFill}>
            <SidebarInner
              groups={groups}
              isActive={isActive}
              userName={userName}
              userEmail={userEmail}
              role={role}
              onClose={onClose}
              showClose={false}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
