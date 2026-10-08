import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CoverScreen, IdScreen, NameScreen, ValueScreen } from "@/components/flow/detail-screens";
import { DoneScreen } from "@/components/flow/done-screen";
import { PrefetchNext } from "@/components/flow/prefetch-next";
import { QuestionScreen } from "@/components/flow/question-screen";
import { ReviewScreen, type ReviewDocument, type ReviewSection } from "@/components/flow/review-screens";
import { CodeScreen, PhoneScreen } from "@/components/flow/sign-in-screens";
import { UploadScreen } from "@/components/flow/upload-screen";
import { ConfirmScreen, LogbookScreen, PlateScreen } from "@/components/flow/vehicle-screens";
import { coverLabels, flow, nameDescriptions, periodLabels, questions, quote, vehicleCategoryLabels } from "@/lib/copy";
import { addonsOf, coversFor, needsSeats, offersMonthly } from "@/lib/data/motor";
import { formatDate } from "@/lib/format/date";
import { isProduct, type Application, type Client } from "@/lib/data/types";
import { getRepo } from "@/lib/data/repo";
import { getFlowContext } from "@/lib/flow/context";
import { answerRows, isQuestionScreen, questionScreens, type QuestionScreenId } from "@/lib/flow/questions";
import { canOpen, flows, isScreen, laterKeyFor, needsValue, previousScreen, screenHref, type Screen } from "@/lib/flow/screens";
import { formatKes } from "@/lib/format/money";
import { formatKenyanPhone } from "@/lib/format/phone";
import { estimateFor } from "@/lib/products/estimate";
import { getPendingCode, getPendingQuote } from "@/lib/session";
import { parseMotorQuote, quoteResultsHref } from "@/lib/flow/motor-quote";
import { quoteMotor } from "@/lib/data/quote-provider";

const screenTitles: Record<string, string> = {
  phone: flow.phone.title,
  code: flow.code.title,
  vehicle: flow.vehicle.title,
  logbook: flow.logbook.title,
  confirm: flow.confirm.titleExtracted,
  cover: flow.cover.title,
  value: flow.value.title,
  name: flow.name.title,
  id: flow.id.title,
  passport: questions.passport.title,
  kra: questions.kra.title,
  registration: questions.registration.title,
  review: flow.review.title,
  done: flow.done.title,
  ...Object.fromEntries(Object.values(questionScreens).map((screen) => [screen.id, screen.title])),
};

/** Each step gets its own tab title, so the browser history makes sense. */
export async function generateMetadata(props: PageProps<"/start/[step]">): Promise<Metadata> {
  const { step } = await props.params;
  return { title: screenTitles[step] ?? flow.phone.title, robots: { index: false } };
}

/**
 * Every screen of every product's flow lives at /start/<screen>?ref=<ref>.
 * The ?ref makes each application's link resumable; /start/resume?ref=…
 * always lands on the first unanswered screen. ?product=health on the
 * phone screen starts (or resumes) that product.
 */
export default async function StartStepPage(props: PageProps<"/start/[step]">) {
  const { step } = await props.params;
  const search = await props.searchParams;
  const ref = typeof search.ref === "string" ? search.ref : undefined;
  const product = isProduct(search.product) ? search.product : undefined;
  const withRef = (path: string) => (ref ? `${path}?ref=${encodeURIComponent(ref)}` : path);

  if (step === "phone") {
    const ctx = await getFlowContext(ref, product);
    if (ctx.kind === "active") redirect(screenHref(ctx.resume, ctx.app.ref));
    if (ctx.kind === "submitted") redirect(`/my/${ctx.app.ref}`);
    // Chose an insurer on the instant quote page: say it's saved, and Back returns to the prices.
    const pendingQuote = ref || (product && product !== "motor") ? null : await getPendingQuote();
    const saved = pendingQuote ? savedQuoteOf(pendingQuote) : null;
    return (
      <PhoneScreen
        refValue={ref}
        product={product}
        savedQuote={saved?.message}
        backHref={saved ? quoteResultsHref(pendingQuote ?? {}) : undefined}
      />
    );
  }

  if (step === "code") {
    const pending = await getPendingCode();
    if (!pending) redirect(withRef("/start/phone"));
    return <CodeScreen phone={formatKenyanPhone(pending.phone)} refValue={ref} />;
  }

  const ctx = await getFlowContext(ref, product);
  if (ctx.kind === "signed_out" || ctx.kind === "not_yours") redirect(withRef("/start/phone"));

  if (step === "done") {
    if (ctx.kind !== "submitted") redirect(screenHref(ctx.resume, ctx.app.ref));
    const stillNeeded = ctx.app.documents
      .filter((doc) => doc.required && (doc.status === "needed" || doc.status === "rejected"))
      .map((doc) => flow.documents[doc.type]);
    const quotes = ctx.app.status === "quotes_ready" ? await getRepo().listQuotes(ctx.app.ref) : [];
    return (
      <DoneScreen
        refValue={ctx.app.ref}
        stillNeeded={stillNeeded}
        estimate={quotes.length ? null : await estimateFor(ctx.app)}
        quotes={quotes.length ? { count: quotes.length, cheapestKes: Math.min(...quotes.map((q) => q.premiumKes)) } : undefined}
      />
    );
  }

  if (ctx.kind === "submitted") redirect(`/my/${ctx.app.ref}`);
  if (step === "resume") redirect(screenHref(ctx.resume, ctx.app.ref));
  if (!isScreen(step)) notFound();
  if (!canOpen(step, ctx.resume, ctx.app)) redirect(screenHref(ctx.resume, ctx.app.ref));
  // Always show the ref in the address bar, so the link can be reopened later.
  if (ref !== ctx.app.ref) redirect(screenHref(step, ctx.app.ref));

  const { app, client } = ctx;
  const screenProps = { refValue: app.ref, backHref: screenHref(previousScreen(step, app), app.ref) };
  const productFlow = flows[app.product];
  const following = productFlow[productFlow.indexOf(step) + 1];
  return (
    <>
      {renderScreen(step, app, client, screenProps)}
      <PrefetchNext href={following ? screenHref(following, app.ref) : undefined} />
    </>
  );
}

function renderScreen(step: Screen, app: Application, client: Client, props: { refValue: string; backHref: string }) {
  const d = app.details;
  if (isQuestionScreen(step)) return <QuestionScreen screenId={step} values={d} {...props} />;

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
      return <CoverScreen {...props} coverType={d.coverType} allowed={coversFor(d.category)} />;
    case "value":
      return <ValueScreen {...props} value={d.vehicleValueKes} />;
    case "name":
      return <NameScreen {...props} name={client.name} email={client.email} description={nameDescriptions[app.product]} />;
    case "id":
      return <IdScreen {...props} />;
    case "passport":
    case "registration":
    case "kra":
      return <UploadScreen screen={step} {...props} />;
    case "review":
      return (
        <ReviewScreen
          {...props}
          {...reviewData(app, client)}
          {...(d.insurer && { actionLabel: quote.review.action, note: quote.review.note })}
        />
      );
    default:
      notFound();
  }
}

/** "Your Britam quote of KES 34,560 is saved…", or null if the quote no longer prices. */
function savedQuoteOf(raw: Record<string, string>): { message: string } | null {
  const parsed = parseMotorQuote(raw, { staleStartIsToday: true });
  if (!parsed.ok) return null;
  const offer = quoteMotor(parsed.details).quotes.find((item) => item.insurer === raw.insurer);
  return offer ? { message: quote.saved(offer.insurer, formatKes(offer.premiumKes)) } : null;
}

/** Motor with an insurer chosen on the instant quote page: what they're buying, priced now. */
function chosenCoverSection(d: Record<string, string>): ReviewSection {
  const labels = flow.review.labels;
  const offer = quoteMotor(d).quotes.find((item) => item.insurer === d.insurer);
  const addons = addonsOf(d).map((addon) => quote.addons[addon].label);
  return {
    id: "cover",
    title: quote.review.section,
    changeHref: quoteResultsHref(d),
    rows: [
      { label: quote.review.insurer, value: d.insurer },
      { label: labels.coverType, value: coverLabels[d.coverType] ?? d.coverType },
      ...(d.coverType === "comprehensive" ? [{ label: quote.addonsLabel, value: addons.join(", ") || quote.noAddons }] : []),
      ...(offersMonthly(d.category) ? [{ label: labels.period, value: periodLabels[d.period] ?? periodLabels.annual }] : []),
      ...(needsValue(d.coverType) && d.vehicleValueKes ? [{ label: labels.value, value: formatKes(Number(d.vehicleValueKes)) }] : []),
      ...(d.startDate ? [{ label: quote.review.startDate, value: formatDate(d.startDate) }] : []),
      ...(offer ? [{ label: quote.review.total, value: formatKes(offer.premiumKes) }] : []),
    ],
  };
}

function reviewData(app: Application, client: Client): { sections: ReviewSection[]; documents: ReviewDocument[] } {
  const d = app.details;
  const labels = flow.review.labels;
  const none = flow.review.notProvided;

  const you: ReviewSection = {
    id: "you",
    title: flow.review.sections.you,
    changeHref: screenHref("name", app.ref),
    rows: [
      { label: labels.name, value: client.name || none },
      { label: labels.phone, value: formatKenyanPhone(client.phone) },
      ...(client.email ? [{ label: labels.email, value: client.email }] : []),
    ],
  };

  let sections: ReviewSection[];
  if (app.product === "motor") {
    const coverLabel = (d.coverType && coverLabels[d.coverType]) || none;
    sections = [
      you,
      {
        id: "car",
        title: flow.review.sections.car,
        changeHref: screenHref("confirm", app.ref),
        rows: [
          { label: labels.category, value: vehicleCategoryLabels[d.category] ?? none },
          ...(needsSeats(d.category) ? [{ label: labels.seats, value: d.seats || none }] : []),
          { label: labels.plate, value: d.plate || none },
          { label: labels.car, value: [d.make, d.model].filter(Boolean).join(" ") || none },
          { label: labels.year, value: d.year || none },
          { label: labels.chassisNumber, value: d.chassisNumber || none },
        ],
      },
      d.insurer ? chosenCoverSection(d) : {
        id: "cover",
        title: flow.review.sections.cover,
        changeHref: screenHref("cover", app.ref),
        rows: [
          { label: labels.coverType, value: coverLabel },
          ...(offersMonthly(d.category) ? [{ label: labels.period, value: periodLabels[d.period] ?? periodLabels.annual }] : []),
          ...(needsValue(d.coverType)
            ? [{ label: labels.value, value: d.vehicleValueKes ? formatKes(Number(d.vehicleValueKes)) : none }]
            : []),
        ],
      },
    ];
  } else {
    // One card per question screen, each with its own "Change" link.
    const questionIds = flows[app.product].filter(isQuestionScreen) as QuestionScreenId[];
    sections = [
      you,
      ...questionIds.map((id) => ({
        id,
        title: questionScreens[id].title,
        changeHref: screenHref(id, app.ref),
        rows: answerRows([id], d).map((row) => ({ label: row.label, value: row.value ?? none })),
      })),
    ];
  }

  const documents: ReviewDocument[] = app.documents
    .filter((doc) => doc.required)
    .map((doc) => {
      const laterKey = laterKeyFor(doc.type);
      const onItsWay = doc.status === "needed" && laterKey !== undefined && d[laterKey] === "uploading";
      return {
        label: flow.documents[doc.type],
        status: onItsWay ? flow.review.documentStatus.uploading : flow.review.documentStatus[doc.status],
        done: doc.status === "uploaded" || doc.status === "verified" || onItsWay,
      };
    });

  return { sections, documents };
}
