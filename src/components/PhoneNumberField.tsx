import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Phone } from "lucide-react";
import type { CountryCode } from "libphonenumber-js";
import { AsYouType, getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function FlagIcon({ code, className }: { code: string; className?: string }) {
  const c = code.trim().toLowerCase();
  // flag-icons uses `fi fi-us` classes.
  return (
    <span
      className={cn("fi inline-block rounded-[3px] border border-border/40", `fi-${c}`, className)}
      aria-hidden
    />
  );
}

function countryDisplayName(code: string): string {
  try {
    const locale =
      (typeof navigator !== "undefined" && navigator.language) ? navigator.language : "en";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DisplayNames: any = (Intl as any).DisplayNames;
    if (DisplayNames) {
      const dn = new DisplayNames([locale], { type: "region" });
      const name = dn.of(code.toUpperCase());
      if (typeof name === "string" && name.trim()) return name;
    }
  } catch {
    /* ignore */
  }
  return code.toUpperCase();
}

function tryE164(nationalInput: string, country: CountryCode): string | null {
  const raw = nationalInput.trim();
  if (!raw) return null;
  const parsed = parsePhoneNumberFromString(raw, country);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number; // E.164, e.g. +2126...
}

function examplePlaceholder(country: CountryCode, calling?: string): string {
  // A few high-traffic examples for nicer UX. Fallback uses calling code.
  switch (country) {
    case "MA":
      return "06 12 34 56 78";
    case "FR":
      return "06 12 34 56 78";
    case "ES":
      return "612 34 56 78";
    case "GB":
      return "07700 900123";
    case "US":
    case "CA":
      return "(201) 555-0123";
    case "DE":
      return "0151 23456789";
    case "IT":
      return "312 345 6789";
    case "NL":
      return "06 12345678";
    case "AU":
      return "0412 345 678";
    case "IN":
      return "98765 43210";
    default:
      return calling ? `Phone number (${calling})` : "Phone number";
  }
}

export function PhoneNumberField({
  label,
  valueE164,
  onChangeE164,
  onMetaChange,
  country,
  onChangeCountry,
  disabled,
}: {
  label: string;
  valueE164: string;
  onChangeE164: (value: string) => void;
  onMetaChange?: (meta: { hasInput: boolean; isValid: boolean }) => void;
  country: CountryCode;
  onChangeCountry: (c: CountryCode) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");

  const countries = useMemo(() => {
    return getCountries()
      .map((code) => {
        const c = String(code).toUpperCase();
        let calling = "";
        try {
          calling = `+${getCountryCallingCode(c as CountryCode)}`;
        } catch {
          calling = "";
        }
        return { code: c, name: countryDisplayName(c), calling };
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, []);

  const selected = useMemo(
    () => countries.find((c) => c.code === country) ?? countries[0],
    [countries, country],
  );

  const placeholder = useMemo(
    () => examplePlaceholder(country, selected?.calling),
    [country, selected?.calling],
  );

  const invalid = useMemo(() => {
    if (!raw.trim()) return false;
    return tryE164(raw, country) == null;
  }, [raw, country]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="h-10 w-[190px] justify-between"
              aria-label="Select country"
            >
              <span className="truncate">
                {selected ? <FlagIcon code={selected.code} className="mr-2 h-4 w-6 align-[-2px]" /> : null}
                {selected?.name ?? "Country"}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countries.map((c) => (
                    <CommandItem
                      key={c.code}
                      value={`${c.name} ${c.code}`}
                      onSelect={() => {
                        onChangeCountry(c.code as CountryCode);
                        setOpen(false);
                        // re-validate against new country
                        const e164 = tryE164(raw, c.code as CountryCode);
                        onChangeE164(e164 ?? "");
                        onMetaChange?.({ hasInput: raw.trim().length > 0, isValid: e164 != null });
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", c.code === country ? "opacity-100" : "opacity-0")} />
                      <FlagIcon code={c.code} className="mr-2 h-4 w-6 align-[-2px]" />
                      <span className="flex-1">{c.name}</span>
                      {c.calling ? <span className="text-xs text-muted-foreground">{c.calling}</span> : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={raw}
            onChange={(e) => {
              const nextRaw = e.target.value;
              const formatted = new AsYouType(country).input(nextRaw);
              setRaw(formatted);
              const e164 = tryE164(formatted, country);
              onChangeE164(e164 ?? "");
              onMetaChange?.({ hasInput: formatted.trim().length > 0, isValid: e164 != null });
            }}
            placeholder={placeholder}
            inputMode="tel"
            disabled={disabled}
            aria-invalid={invalid}
            className={cn("pl-9", invalid && "border-destructive focus-visible:ring-destructive")}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className={cn("text-xs", invalid ? "text-destructive" : "text-muted-foreground")}>
          {invalid ? "Please enter a valid phone number for the selected country." : "Optional, but helps us contact you faster."}
        </p>
        {valueE164 ? <p className="text-[11px] text-muted-foreground">{valueE164}</p> : null}
      </div>
    </div>
  );
}

