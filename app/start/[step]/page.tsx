import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DoneScreen } from "@/components/flow/done-screen";
import { ConfirmScreen, LogbookScreen, PlateScreen } from "@/components/flow/vehicle-screens";
import { CodeScreen, PhoneScreen } from "@/components/flow/sign-in-screens";
import { CoverScreen, IdScreen, NameScreen, ValueScreen } from "@/components/flow/detail-screens";
import { ReviewScreen, type ReviewDocument, type ReviewSection } from "@/components/flow/review-screens";
import { flow } from "@/lib/copy";
import type { Application, Client } from "@/lib/data/types";
import { getFlowContext } from "@/lib/flow/context";
import { canOpen, isScreen, needsValue, previousScreen, screenHref, type Screen } from "@/lib/flow/screens";
import { formatKes } from "@/lib/format/money";
import { formatKenyanPhone } from "@/lib/format/phone";
import { getPendingCode } from "@/lib/session";

export const metadata: Metadata = { title: flow.phone.title, robots: { index: false } };

/**
 * Every screen of the client flow lives at /start/<screen>?ref=<ref>.
 * The ?ref makes each application's link resumable; /start/resume?ref=…
 * always lands on the first unanswered screen.
 */
export default async function StartStepPage(props: PageProps<"/start/[step]">) {
  const { step } = await props.params;
  const search = await props.searchParams;
  const ref = typeof search.ref === "string" ? search.ref : undefined;
  const withRef = (path: string) => (ref ? `${path}?ref=${encodeURIComponent(ref)}` : path);

  if (step === "phone") {
    const ctx = await getFlowContext(ref);
    if (ctx.kind === "active") redirect(screenHref(ctx.resume, ctx.app.ref));
    if (ctx.kind === "submitted") redirect(`/my/${ctx.app.ref}`);
    return <PhoneScreen refValue={ref} />;
  }

  if (step === "code") {
    const pending = await getPendingCode();
    if (!pending) redirect(withRef("/start/phone"));
    return <CodeScreen phone={formatKenyanPhone(pending.phone)} refValue={ref} />;
  }

  const ctx = await getFlowContext(ref);
  if (ctx.kind === "signed_out" || ctx.kind === "not_yours") redirect(withRef("/start/phone"));

  if (step === "done") {
    if (ctx.kind !== "submitted") redirect(screenHref(ctx.resume, ctx.app.ref));
    const stillNeeded = ctx.app.documents
      .filter((doc) => doc.required && (doc.status === "needed" || doc.status === "rejected"))
      .map((doc) => flow.documents[doc.type]);
    return <DoneScreen refValue={ctx.app.ref} stillNeeded={stillNeeded} />;
  }

  if (ctx.kind === "submitted") redirect(`/my/${ctx.app.ref}`);
  if (step === "resume") redirect(screenHref(ctx.resume, ctx.app.ref));
  if (!isScreen(step)) notFound();
  if (!canOpen(step, ctx.resume, ctx.app)) redirect(screenHref(ctx.resume, ctx.app.ref));
  // Always show the ref in the address bar, so the link can be reopened later.
  if (ref !== ctx.app.ref) redirect(screenHref(step, ctx.app.ref));

  const { app, client } = ctx;
  const screenProps = { refValue: app.ref, backHref: screenHref(previousScreen(step, app), app.ref) };
  return renderScreen(step, app, client, screenProps);
}

function renderScreen(
  step: Screen,
  app: Application,
  client: Client,
  props: { refValue: string; backHref: string },
) {
  const d = app.details;
  switch (step) {
    case "vehicle":
      return <PlateScreen {...props} plate={d.plate} />;
    case "logbook":
      return <LogbookScreen {...props} />;
    case "confirm": {
      const extracted = app.documents.some((doc) => doc.type === "logbook" && doc.status !== "needed");
      return (
        <ConfirmScreen
          {...props}
          values={d}
          extracted={extracted && d.logbookLater !== "yes"}
          lowConfidence={d.lowConfidence ? d.lowConfidence.split(",") : []}
        />
      );
    }
    case "cover":
      return <CoverScreen {...props} coverType={d.coverType} />;
    case "value":
      return <ValueScreen {...props} value={d.vehicleValueKes} />;
    case "name":
      return <NameScreen {...props} name={client.name} />;
    case "id":
      return <IdScreen {...props} />;
    case "review":
      return <ReviewScreen {...props} {...reviewData(app, client)} />;
    default:
      notFound();
  }
}

function reviewData(app: Application, client: Client): { sections: ReviewSection[]; documents: ReviewDocument[] } {
  const d = app.details;
  const labels = flow.review.labels;
  const none = flow.review.notProvided;
  const coverLabel = flow.cover.options.find((option) => option.value === d.coverType)?.label ?? none;

  const sections: ReviewSection[] = [
    {
      id: "you",
      title: flow.review.sections.you,
      changeHref: screenHref("name", app.ref),
      rows: [
        { label: labels.name, value: client.name || none },
        { label: labels.phone, value: formatKenyanPhone(client.phone) },
      ],
    },
    {
      id: "car",
      title: flow.review.sections.car,
      changeHref: screenHref("confirm", app.ref),
      rows: [
        { label: labels.plate, value: d.plate || none },
        { label: labels.car, value: [d.make, d.model].filter(Boolean).join(" ") || none },
        { label: labels.year, value: d.year || none },
        { label: labels.chassisNumber, value: d.chassisNumber || none },
      ],
    },
    {
      id: "cover",
      title: flow.review.sections.cover,
      changeHref: screenHref("cover", app.ref),
      rows: [
        { label: labels.coverType, value: coverLabel },
        ...(needsValue(d.coverType)
          ? [{ label: labels.value, value: d.vehicleValueKes ? formatKes(Number(d.vehicleValueKes)) : none }]
          : []),
      ],
    },
  ];

  const documents: ReviewDocument[] = app.documents
    .filter((doc) => doc.required)
    .map((doc) => ({
      label: flow.documents[doc.type],
      status: flow.review.documentStatus[doc.status],
      done: doc.status === "uploaded" || doc.status === "verified",
    }));

  return { sections, documents };
}
