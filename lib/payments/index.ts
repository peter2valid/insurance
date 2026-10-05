import { getRepo } from "@/lib/data/repo";
import type { Payment } from "@/lib/data/types";

/**
 * Payments interface. SIMULATED today: "sending an M-Pesa request" only
 * records a pending payment; the client's status page offers a clearly
 * labelled demo button that plays the part of the phone approving it.
 *
 * Real M-Pesa later: a Daraja (Safaricom) implementation sends an STK push
 * from `requestPayment`, and its callback calls `confirmPayment` in
 * lib/admin/workflow.ts with the real receipt. Nothing else changes.
 */
export interface PaymentProvider {
  /** True while payments are simulated (shows the demo approve button). */
  readonly simulated: boolean;
  requestPayment(input: { ref: string; phone: string; amountKes: number }): Promise<Payment>;
}

const simulatedMpesa: PaymentProvider = {
  simulated: true,
  async requestPayment({ ref, phone, amountKes }) {
    return getRepo().createPayment({ applicationRef: ref, phone, amountKes, method: "mpesa" });
  },
};

export function getPaymentProvider(): PaymentProvider {
  return simulatedMpesa;
}

/** A receipt that looks like M-Pesa's (10 characters). SIMULATED only. */
export function simulatedReceipt(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let code = "SK";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
