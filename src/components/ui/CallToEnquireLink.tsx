import { Phone } from "lucide-react";
import clsx from "clsx";
import { JADE_ENQUIRY_TEL } from "@/lib/siteContact";

type CallToEnquireLinkProps = {
  className?: string;
  ariaLabel?: string;
  title?: string;
};

/** Standard call icon anchor — caller owns layout classes (square, round, navbar glass, etc.). */
export default function CallToEnquireLink({
  className,
  ariaLabel = "Call to enquire",
  title = "Call us",
}: CallToEnquireLinkProps) {
  return (
    <a
      href={JADE_ENQUIRY_TEL}
      className={clsx(className)}
      aria-label={ariaLabel}
      title={title}
    >
      <Phone className="h-[18px] w-[18px]" strokeWidth={1.25} aria-hidden />
    </a>
  );
}
