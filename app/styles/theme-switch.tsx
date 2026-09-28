"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { styles as copy } from "@/lib/copy";

type Theme = "system" | "light" | "dark";

/** Forces light or dark on <html data-theme> so both can be checked. */
export function ThemeSwitch() {
  const [theme, setTheme] = React.useState<Theme>("system");

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div role="group" aria-label={copy.theme.label} className="flex flex-wrap gap-2">
      {(["system", "light", "dark"] as const).map((option) => (
        <Button
          key={option}
          variant={theme === option ? "primary" : "secondary"}
          aria-pressed={theme === option}
          onClick={() => setTheme(option)}
        >
          {copy.theme[option]}
        </Button>
      ))}
    </div>
  );
}
