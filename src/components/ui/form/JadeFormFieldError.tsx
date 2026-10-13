import { JADE_FORM_WARN } from "@/lib/jadeFormTokens";

export default function JadeFormFieldError({
  id,
  message,
}: {
  id: string;
  message: string;
}) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 text-[11px] md:text-xs font-manrope leading-snug"
      style={{ color: JADE_FORM_WARN }}
    >
      {message}
    </p>
  );
}
