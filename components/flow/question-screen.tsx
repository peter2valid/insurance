"use client";

import * as React from "react";
import { saveAnswers } from "@/app/start/actions";
import { Button } from "@/components/ui/button";
import { ChoiceCards } from "@/components/ui/choice-cards";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { flow } from "@/lib/copy";
import { activeFields, questionScreens, type QuestionField, type QuestionScreenId } from "@/lib/flow/questions";
import { stepOf, TOTAL_STEPS } from "@/lib/flow/screens";
import { FlowStep } from "./flow-step";
import { useFlowAction } from "./use-flow-action";

/**
 * Renders any declarative question screen (health, travel, business) from
 * its config in lib/flow/questions. One question per screen, FlowStep
 * template, kit components only.
 */
export function QuestionScreen({
  screenId,
  refValue,
  backHref,
  values,
}: {
  screenId: QuestionScreenId;
  refValue: string;
  backHref: string;
  values: Record<string, string>;
}) {
  const screen = questionScreens[screenId];
  const { formAction, pending, errors, submitted } = useFlowAction(saveAnswers);
  // Answers on this screen can reveal follow-up fields (e.g. "Yes" -> "What condition?").
  const [live, setLive] = React.useState<Record<string, string>>({});
  const fields = activeFields(screen, { ...values, ...live });

  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement;
    if (target.type !== "radio" && target.type !== "checkbox" && target.tagName !== "SELECT") return;
    const form = event.currentTarget;
    const value =
      target.type === "checkbox"
        ? new FormData(form).getAll(target.name).map(String).join(",")
        : target.value;
    setLive((current) => ({ ...current, [target.name]: value }));
  }

  return (
    <FlowStep
      as="form"
      action={formAction}
      onChange={handleChange}
      noValidate
      step={{ current: stepOf[screenId], total: TOTAL_STEPS }}
      backHref={backHref}
      title={screen.title}
      description={screen.description}
      reassurance={screen.reassurance}
      helpStep={screen.stepName}
      formError={errors._form}
      primaryAction={
        <Button type="submit" loading={pending}>
          {flow.continue}
        </Button>
      }
    >
      <input type="hidden" name="ref" value={refValue} />
      <input type="hidden" name="screen" value={screenId} />
      {fields.map((field, index) => (
        <FieldInput
          key={field.name}
          field={field}
          value={submitted.screen ? (submitted[field.name] ?? "") : values[field.name]}
          error={errors[field.name]}
          // A single choice question is the whole screen: its legend repeats the title.
          hideLabel={fields.length === 1 && (field.kind === "choice" || field.kind === "multi")}
          autoFocus={index === 0}
        />
      ))}
    </FlowStep>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function FieldInput({
  field,
  value,
  error,
  hideLabel,
  autoFocus,
}: {
  field: QuestionField;
  value?: string;
  error?: string;
  hideLabel: boolean;
  autoFocus: boolean;
}) {
  const common = { name: field.name, label: field.label, hint: field.hint, error, optional: field.optional };

  switch (field.kind) {
    case "choice":
    case "multi":
      return (
        <ChoiceCards
          name={field.name}
          label={field.label}
          hideLabel={hideLabel}
          options={field.options ?? []}
          multiple={field.kind === "multi"}
          defaultValue={value}
          error={error}
        />
      );
    case "select":
      return <Select {...common} options={field.options ?? []} defaultValue={value} />;
    case "number":
      return <Input {...common} inputMode="numeric" autoComplete="off" defaultValue={value} autoFocus={autoFocus} />;
    case "money":
      return (
        <Input
          {...common}
          prefix={flow.value.prefix}
          inputMode="numeric"
          autoComplete="off"
          defaultValue={value ? Number(value).toLocaleString("en-KE") : ""}
          autoFocus={autoFocus}
        />
      );
    case "date":
      return <Input {...common} type="date" min={today()} defaultValue={value} autoFocus={autoFocus} />;
    default:
      return <Input {...common} autoComplete={field.autoComplete} defaultValue={value} autoFocus={autoFocus} />;
  }
}
