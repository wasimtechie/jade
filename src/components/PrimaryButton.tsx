import React from "react";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  JADE_BTN_CHROME_HEIGHT,
  JADE_BTN_HEIGHT,
  JADE_BTN_LAYOUT,
  JADE_BTN_TYPO,
  jadeButtonVariantClass,
  jadeButtonWidthClass,
  type JadeButtonVariant,
  type JadeButtonWidth,
} from "@/lib/jadeButtonTokens";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  target?: string;
  rel?: string;
  withArrow?: boolean;
  className?: string;
  children: React.ReactNode;
  /** Visual style — secondary used for disabled form submits. */
  variant?: JadeButtonVariant;
  /** Horizontal layout profile. */
  width?: JadeButtonWidth;
  /** Standard 48px CTA vs 44px navbar chrome (matches icon row). */
  size?: "standard" | "chrome";
}

/**
 * PrimaryButton — canonical Jade CTA (48px standard height).
 * Use width="form" | "section" | "compact" for layout profiles.
 * Navbar BOOK uses className override with JADE_BTN_CHROME_HEIGHT (44px).
 */
export default function PrimaryButton({
  href,
  target,
  rel,
  withArrow = true,
  className = "",
  children,
  type = "button",
  disabled,
  variant = "primary",
  width = "auto",
  size = "standard",
  ...buttonProps
}: PrimaryButtonProps) {
  const effectiveVariant =
    disabled && variant === "primary" ? "secondary" : variant;

  const content = (
    <>
      {children}
      {withArrow && (
        <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 md:h-5 md:w-5" />
      )}
    </>
  );

  const sharedClassName = clsx(
    "group",
    JADE_BTN_LAYOUT,
    size === "chrome" ? JADE_BTN_CHROME_HEIGHT : JADE_BTN_HEIGHT,
    JADE_BTN_TYPO,
    jadeButtonWidthClass(width),
    jadeButtonVariantClass(effectiveVariant, disabled),
    width === "auto" && size !== "chrome" && "px-[clamp(12px,1.4vw,18px)] shrink",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={clsx(
          sharedClassName,
          disabled && "pointer-events-none opacity-50",
        )}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : buttonProps.tabIndex}
        id={buttonProps.id}
        style={buttonProps.style}
        title={buttonProps.title}
        onClick={
          disabled
            ? (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault()
            : (buttonProps.onClick as
                | React.MouseEventHandler<HTMLAnchorElement>
                | undefined)
        }
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={sharedClassName}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
