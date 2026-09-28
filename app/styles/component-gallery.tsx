"use client";

import * as React from "react";
import { ArrowRight, Inbox, Sparkles, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ChecklistItem } from "@/components/ui/checklist-item";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FileUpload, type FileUploadState } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusTimeline } from "@/components/ui/status-timeline";
import { StepHeader } from "@/components/ui/step-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToastCard, toast } from "@/components/ui/toast";
import { statusLabels, styles as copy } from "@/lib/copy";
import { applicationStatuses } from "@/lib/data/types";
import { Section, State, StateGrid } from "./showcase";

const s = copy.states;
const d = copy.demo;
const noop = () => {};

export function ComponentGallery() {
  return (
    <>
      <ButtonSection />
      <InputSection />
      <PhoneSection />
      <OtpSection />
      <SelectSection />
      <UploadSection />
      <StepHeaderSection />
      <CardSection />
      <BadgeSection />
      <TimelineSection />
      <ChecklistSection />
      <ToastSection />
      <EmptySection />
      <SkeletonSection />
      <DialogSection />
      <TabsSection />
      <AvatarSection />
    </>
  );
}

function ButtonSection() {
  const variants = [
    { variant: "primary", label: d.button.primary },
    { variant: "secondary", label: d.button.secondary },
    { variant: "ghost", label: d.button.ghost },
    { variant: "danger", label: d.button.danger },
  ] as const;

  return (
    <Section id="button" title="Button">
      {variants.map(({ variant, label }) => (
        <div key={variant} className="flex flex-col gap-3">
          <p className="text-sm font-medium text-ink">{variant}</p>
          <StateGrid columns={5}>
            <State label={s.default}>
              <Button variant={variant}>{label}</Button>
            </State>
            <State label={s.hover}>
              <Button variant={variant} data-force="hover">
                {label}
              </Button>
            </State>
            <State label={s.focus}>
              <Button variant={variant} data-force="focus">
                {label}
              </Button>
            </State>
            <State label={s.disabled}>
              <Button variant={variant} disabled>
                {label}
              </Button>
            </State>
            <State label={s.loading}>
              <Button variant={variant} loading>
                {label}
              </Button>
            </State>
          </StateGrid>
        </div>
      ))}
      <StateGrid columns={2}>
        <State label="size=icon">
          <Button variant="ghost" size="icon" aria-label={d.button.icon}>
            <X aria-hidden />
          </Button>
        </State>
        <State label="block">
          <Button block>
            {d.button.block}
            <ArrowRight aria-hidden />
          </Button>
        </State>
      </StateGrid>
    </Section>
  );
}

function InputSection() {
  const base = { label: d.input.label, hint: d.input.hint };
  return (
    <Section id="input" title="Input">
      <StateGrid>
        <State label={s.default}>
          <Input {...base} />
        </State>
        <State label={s.hover}>
          <Input {...base} data-force="hover" />
        </State>
        <State label={s.focus}>
          <Input {...base} data-force="focus" />
        </State>
        <State label={s.filled}>
          <Input {...base} defaultValue={d.input.filled} />
        </State>
        <State label={s.disabled}>
          <Input {...base} defaultValue={d.input.filled} disabled />
        </State>
        <State label={s.error}>
          <Input {...base} defaultValue={d.input.partial} error={d.input.error} />
        </State>
        <State label="optional">
          <Input label={d.input.optionalLabel} optional />
        </State>
      </StateGrid>
    </Section>
  );
}

function PhoneSection() {
  const base = { label: d.phone.label, hint: d.phone.hint };
  return (
    <Section id="phone-input" title="PhoneInput">
      <StateGrid>
        <State label={s.default}>
          <PhoneInput {...base} />
        </State>
        <State label={s.hover}>
          <PhoneInput {...base} data-force="hover" />
        </State>
        <State label={s.focus}>
          <PhoneInput {...base} data-force="focus" />
        </State>
        <State label={s.filled}>
          <PhoneInput {...base} defaultValue={d.phone.filled} />
        </State>
        <State label={s.disabled}>
          <PhoneInput {...base} defaultValue={d.phone.filled} disabled />
        </State>
        <State label={s.error}>
          <PhoneInput {...base} defaultValue={d.phone.partial} error={d.phone.error} />
        </State>
      </StateGrid>
    </Section>
  );
}

function OtpSection() {
  const [code, setCode] = React.useState("");
  return (
    <Section id="otp-input" title="OtpInput">
      <StateGrid>
        <State label={s.live}>
          <OtpInput label={d.otp.label} value={code} onChange={setCode} />
        </State>
        <State label={s.empty}>
          <OtpInput label={d.otp.label} value="" onChange={noop} />
        </State>
        <State label={`${s.focus} · ${s.partial}`}>
          <OtpInput label={d.otp.label} value={d.otp.partial} onChange={noop} data-force="focus" />
        </State>
        <State label={s.complete}>
          <OtpInput label={d.otp.label} value={d.otp.complete} onChange={noop} />
        </State>
        <State label={s.disabled}>
          <OtpInput label={d.otp.label} value={d.otp.complete} onChange={noop} disabled />
        </State>
        <State label={s.error}>
          <OtpInput label={d.otp.label} value={d.otp.wrong} onChange={noop} error={d.otp.error} />
        </State>
      </StateGrid>
    </Section>
  );
}

function SelectSection() {
  const base = { label: d.select.label, options: d.select.options };
  return (
    <Section id="select" title="Select">
      <StateGrid>
        <State label={s.default}>
          <Select {...base} />
        </State>
        <State label={s.hover}>
          <Select {...base} data-force="hover" />
        </State>
        <State label={s.focus}>
          <Select {...base} data-force="focus" />
        </State>
        <State label={s.filled}>
          <Select {...base} defaultValue="comprehensive" />
        </State>
        <State label={s.disabled}>
          <Select {...base} defaultValue="comprehensive" disabled />
        </State>
        <State label={s.error}>
          <Select {...base} error={d.select.error} />
        </State>
      </StateGrid>
    </Section>
  );
}

/** Simulated upload for the demo: fakes progress, uploads nothing. */
function useFakeUpload() {
  const [state, setState] = React.useState<FileUploadState>("empty");
  const [progress, setProgress] = React.useState(0);
  const [file, setFile] = React.useState<{ name: string; url?: string }>();

  React.useEffect(() => () => {
    if (file?.url) URL.revokeObjectURL(file.url);
  }, [file]);

  function select(picked: File) {
    setFile({
      name: picked.name,
      url: picked.type.startsWith("image/") ? URL.createObjectURL(picked) : undefined,
    });
    setState("uploading");
    setProgress(0);
    let value = 0;
    const timer = setInterval(() => {
      value += 20;
      setProgress(value);
      if (value >= 100) {
        clearInterval(timer);
        setState("uploaded");
      }
    }, 250);
  }

  return {
    state,
    progress,
    fileName: file?.name,
    previewUrl: file?.url,
    onSelect: select,
    onRemove: () => {
      setState("empty");
      setFile(undefined);
    },
  };
}

function UploadSection() {
  const live = useFakeUpload();
  const base = { label: d.upload.label, hint: d.upload.hint, onSelect: noop };
  return (
    <Section id="file-upload" title="FileUpload">
      <StateGrid columns={2}>
        <State label={s.live}>
          <FileUpload label={d.upload.label} hint={d.upload.hint} emphasis="primary" {...live} />
        </State>
        <State label={s.empty}>
          <FileUpload {...base} />
        </State>
        <State label={s.primary}>
          <FileUpload {...base} emphasis="primary" />
        </State>
        <State label={s.uploading}>
          <FileUpload {...base} state="uploading" progress={45} fileName={d.upload.fileName} />
        </State>
        <State label={s.uploaded}>
          <FileUpload {...base} state="uploaded" fileName={d.upload.fileName} onRemove={noop} />
        </State>
        <State label={s.error}>
          <FileUpload {...base} state="error" error={d.upload.error} />
        </State>
        <State label={s.disabled}>
          <FileUpload {...base} label={d.upload.idLabel} disabled />
        </State>
      </StateGrid>
    </Section>
  );
}

function StepHeaderSection() {
  return (
    <Section id="step-header" title="StepHeader">
      <StateGrid columns={2}>
        <State label={s.first}>
          <StepHeader current={1} total={5} />
        </State>
        <State label={s.withBack}>
          <StepHeader current={3} total={5} onBack={noop} />
        </State>
      </StateGrid>
    </Section>
  );
}

function CardSection() {
  return (
    <Section id="card" title="Card">
      <StateGrid>
        <State label={s.default}>
          <Card>
            <CardTitle>{d.card.title}</CardTitle>
            <CardDescription>{d.card.body}</CardDescription>
          </Card>
        </State>
        <State label={s.alt}>
          <Card tone="alt">
            <CardTitle>{d.card.altTitle}</CardTitle>
            <CardDescription>{d.card.altBody}</CardDescription>
          </Card>
        </State>
        <State label={`${s.interactive} · ${s.hover}`}>
          <Card interactive data-force="hover">
            <CardTitle>{d.card.title}</CardTitle>
            <CardDescription>{d.card.body}</CardDescription>
          </Card>
        </State>
      </StateGrid>
    </Section>
  );
}

function BadgeSection() {
  return (
    <Section id="status-badge" title="StatusBadge">
      <State label={s.statuses}>
        <div className="flex flex-wrap gap-2">
          {applicationStatuses.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </State>
      <State label={s.tones}>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="new" label={d.badges.new} icon={Sparkles} />
          <StatusBadge tone="warn" label={d.badges.stalled} />
          <StatusBadge tone="info" label={d.badges.waiting} />
          <StatusBadge tone="danger" label={d.badges.rejected} />
          <StatusBadge tone="neutral" label={d.badges.neutral} />
        </div>
      </State>
    </Section>
  );
}

function TimelineSection() {
  return (
    <Section id="status-timeline" title="StatusTimeline">
      <StatusTimeline
        items={[
          { id: "received", label: statusLabels.received, state: "done", meta: d.timeline.receivedMeta },
          {
            id: "documents_checked",
            label: statusLabels.documents_checked,
            state: "done",
            meta: d.timeline.checkedMeta,
          },
          {
            id: "preparing_quotes",
            label: statusLabels.preparing_quotes,
            state: "current",
            description: d.timeline.currentDescription,
          },
          { id: "quotes_ready", label: statusLabels.quotes_ready, state: "upcoming" },
          { id: "covered", label: statusLabels.covered, state: "upcoming" },
        ]}
      />
    </Section>
  );
}

function ChecklistSection() {
  const c = d.checklist;
  return (
    <Section id="checklist-item" title="ChecklistItem">
      <ul className="flex max-w-flow flex-col gap-3">
        <ChecklistItem title={c.logbook} status="verified" />
        <ChecklistItem title={c.id} description={c.description} status="uploaded" />
        <ChecklistItem title={c.kraPin} status="needed" actionLabel={c.upload} onAction={noop} />
        <ChecklistItem
          title={c.licence}
          status="rejected"
          reason={c.rejectedReason}
          actionLabel={c.uploadAgain}
          onAction={noop}
        />
        <ChecklistItem
          title={c.kraPin}
          status="needed"
          actionLabel={c.upload}
          onAction={noop}
          actionLoading
        />
      </ul>
    </Section>
  );
}

function ToastSection() {
  const t = d.toast;
  return (
    <Section id="toast" title="Toast">
      <StateGrid>
        <State label="success">
          <ToastCard tone="success" title={t.success} description={t.successBody} />
        </State>
        <State label="error">
          <ToastCard tone="error" title={t.error} description={t.errorBody} />
        </State>
        <State label="info">
          <ToastCard tone="info" title={t.info} description={t.infoBody} />
        </State>
      </StateGrid>
      <State label={s.live}>
        <div>
          <Button
            variant="secondary"
            onClick={() => toast({ title: t.success, description: t.successBody })}
          >
            {t.trigger}
          </Button>
        </div>
      </State>
    </Section>
  );
}

function EmptySection() {
  return (
    <Section id="empty-state" title="EmptyState">
      <EmptyState
        icon={Inbox}
        title={d.empty.title}
        body={d.empty.body}
        action={<Button variant="secondary">{d.empty.action}</Button>}
        className="max-w-flow"
      />
    </Section>
  );
}

function SkeletonSection() {
  return (
    <Section id="skeleton" title="Skeleton">
      <div aria-busy="true" aria-label={s.loading} className="max-w-flow">
        <Card>
          <div className="flex items-center gap-3">
            <Skeleton shape="circle" className="size-10" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton shape="line" className="w-1/2" />
              <Skeleton shape="line" className="w-1/3" />
            </div>
          </div>
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    </Section>
  );
}

function DialogSection() {
  const t = d.dialog;
  return (
    <Section id="dialog" title="Dialog">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" className="self-start">
            {t.trigger}
          </Button>
        </DialogTrigger>
        <DialogContent title={t.title} description={t.description}>
          <Input label={t.reasonLabel} defaultValue={t.reasonValue} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">{t.cancel}</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>{t.confirm}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Section>
  );
}

function TabsSection() {
  const t = d.tabs;
  return (
    <Section id="tabs" title="Tabs">
      <Tabs defaultValue="details" className="max-w-flow">
        <TabsList>
          <TabsTrigger value="details">{t.details}</TabsTrigger>
          <TabsTrigger value="documents">{t.documents}</TabsTrigger>
          <TabsTrigger value="messages" disabled>
            {t.messages}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <p className="text-ink-quiet">{t.detailsBody}</p>
        </TabsContent>
        <TabsContent value="documents">
          <p className="text-ink-quiet">{t.documentsBody}</p>
        </TabsContent>
      </Tabs>
    </Section>
  );
}

function AvatarSection() {
  const [first, second, third] = d.avatar.names;
  return (
    <Section id="avatar" title="Avatar">
      <State label={`${s.sizes} · ${s.withImage}`}>
        <div className="flex items-center gap-3">
          <Avatar name={first} size="sm" />
          <Avatar name={second} />
          <Avatar name={third} size="lg" />
        </div>
      </State>
    </Section>
  );
}
