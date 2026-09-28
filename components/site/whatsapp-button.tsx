import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";

type WhatsAppButtonProps = {
  /** Pre-filled message, e.g. with the reference and current step. */
  message?: string;
  label: string;
  /** Shorter label for small screens. */
  shortLabel?: string;
  variant?: ButtonProps["variant"];
  block?: boolean;
  className?: string;
};

/** Opens WhatsApp in a new tab with a pre-filled message. */
export function WhatsAppButton({
  message,
  label,
  shortLabel,
  variant = "secondary",
  block,
  className,
}: WhatsAppButtonProps) {
  return (
    <Button asChild variant={variant} block={block} className={className}>
      <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">
        <MessageCircle aria-hidden />
        {shortLabel ? (
          <>
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </a>
    </Button>
  );
}
