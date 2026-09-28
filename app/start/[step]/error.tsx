"use client";

import { FlowStepError } from "@/components/flow/flow-step";
import { Button } from "@/components/ui/button";
import { flow } from "@/lib/copy";

export default function StepError({ reset }: { error: Error; reset: () => void }) {
  return (
    <FlowStepError
      action={
        <Button variant="secondary" onClick={reset}>
          {flow.loadError.action}
        </Button>
      }
    />
  );
}
