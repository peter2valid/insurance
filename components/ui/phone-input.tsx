import { brand } from "@/lib/brand";
import { Input, type InputProps } from "./input";

type PhoneInputProps = Omit<InputProps, "type" | "prefix">;

/**
 * Kenyan mobile number with a fixed +254 prefix. Validate with
 * normalizeKenyanPhone() from lib/format/phone.
 */
function PhoneInput(props: PhoneInputProps) {
  return (
    <Input
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      prefix={brand.locale.phoneCountryCode}
      {...props}
    />
  );
}

export { PhoneInput };
export type { PhoneInputProps };
