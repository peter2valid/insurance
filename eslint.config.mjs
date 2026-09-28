import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// CLAUDE.md §4.1: no raw hex codes or arbitrary Tailwind values
// (e.g. `w-[437px]`) in feature code. Values come from lib/tokens.
// Arbitrary *values* end in "]" followed by a space, quote end or "/opacity".
// Arbitrary *variants* like `data-[state=open]:` end in "]:" and are allowed.
const arbitraryValue = String.raw`(^|\s)[a-z0-9:!-]+-\[[^\]]+\](?=\s|$|\/)`;
const hex = String.raw`#[0-9a-fA-F]{3,8}\b`;

const noRawValues = [
  {
    selector: `Literal[value=/${hex}/]`,
    message: "Raw hex colour. Use a colour token from lib/tokens.",
  },
  {
    selector: `TemplateElement[value.raw=/${hex}/]`,
    message: "Raw hex colour. Use a colour token from lib/tokens.",
  },
  {
    selector: `Literal[value=/${arbitraryValue}/]`,
    message: "Arbitrary Tailwind value. Add a token first (ask), then use it.",
  },
  {
    selector: `TemplateElement[value.raw=/${arbitraryValue}/]`,
    message: "Arbitrary Tailwind value. Add a token first (ask), then use it.",
  },
];

const noInlineStyle = {
  selector: "JSXAttribute[name.name='style']",
  message: "No inline styles in feature code. Use token classes.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Feature code: tokens only, no inline styles.
  {
    files: ["app/**/*.{ts,tsx}", "components/{flow,status,admin,site}/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", ...noRawValues, noInlineStyle],
    },
  },
  // Kit: tokens only. Inline style is allowed solely for computed values
  // such as progress width.
  {
    files: ["components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", ...noRawValues],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
