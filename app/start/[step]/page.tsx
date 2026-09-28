import { notFound } from "next/navigation";
import { FlowStep } from "@/components/flow/flow-step";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { TextLink } from "@/components/ui/text-link";
import { flow } from "@/lib/copy";

// Stage 3 placeholder: one step rendered in the FlowStep template.
// The real, resumable flow arrives in Stage 6.
export function generateStaticParams() {
  return [{ step: "phone" }];
}
export const dynamicParams = false;

export default async function StartStepPage(props: PageProps<"/start/[step]">) {
  const { step } = await props.params;
  if (step !== "phone") notFound();
  const copy = flow.placeholder;

  return (
    <FlowStep
      step={{ current: 1, total: 5 }}
      backHref="/"
      title={copy.title}
      description={copy.description}
      reassurance={copy.reassurance}
      primaryAction={<Button>{copy.action}</Button>}
      secondaryAction={
        <TextLink href="/#faq" standalone>
          {copy.secondary}
        </TextLink>
      }
    >
      <PhoneInput label={copy.phoneLabel} hint={copy.phoneHint} />
    </FlowStep>
  );
}
