import { notifyTemplates } from "@/lib/copy";
import type { Channel } from "@/lib/data/types";

export type TemplateName = keyof typeof notifyTemplates;
export type TemplateData<T extends TemplateName> = Parameters<(typeof notifyTemplates)[T]>[0];

export type NotificationInput<T extends TemplateName = TemplateName> = {
  channel: Channel;
  /** Phone (E.164) or email. "admin" addresses the broker. */
  to: string;
  audience: Audience;
  template: T;
  data: TemplateData<T>;
  applicationRef?: string;
};

export interface OutboxItem {
  id: string;
  channel: Channel;
  to: string;
  audience: Audience;
  template: TemplateName;
  body: string;
  applicationRef?: string;
  createdAt: string;
  /**
   * What actually happened, shown in the Outbox:
   * - "simulated": logged only (no provider, admin messages, sample clients)
   * - "sent": really sent on WhatsApp via Twilio (demo sandbox)
   * - "failed": Twilio refused it (e.g. the number hasn't joined the sandbox)
   */
  delivery: Delivery;
}

export type Audience = "client" | "admin" | "agent";

export type Delivery = "simulated" | "sent" | "failed";

export interface Notifier {
  send<T extends TemplateName>(input: NotificationInput<T>): Promise<OutboxItem>;
  listOutbox(): Promise<OutboxItem[]>;
}

export function renderTemplate<T extends TemplateName>(template: T, data: TemplateData<T>): string {
  const render = notifyTemplates[template] as (d: TemplateData<T>) => string;
  return render(data);
}

