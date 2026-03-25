import { TransactionalMessageEmail } from "@/app/emails/TransactionalMessageEmail";
import { Resend } from "resend";

export type SendTransactionalEmailParams = {
  name: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  message: string;
};

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

/**
 * Sends email via Resend (server-only). Requires RESEND_API_KEY and RESEND_FROM_EMAIL.
 * When `fromEmail` is set, it is used as Reply-To so recipients can reach the original sender.
 * HTML uses the branded {@link TransactionalMessageEmail} template; `text` is a plain fallback.
 */
export async function sendTransactionalEmail(
  params: SendTransactionalEmailParams,
): Promise<{ id: string }> {
  const { name, fromEmail, toEmail, subject, message } = params;

  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is not configured.");
  }

  const to = toEmail.trim();
  if (!to) {
    throw new Error("Recipient address is required.");
  }

  const replyTo = fromEmail.trim() || undefined;

  const lines: string[] = [];
  if (name.trim()) lines.push(`Name: ${name.trim()}`);
  if (fromEmail.trim()) lines.push(`Email: ${fromEmail.trim()}`);
  if (lines.length) lines.push("");
  lines.push(message);

  const text = lines.join("\n");
  const subjectLine = subject.trim();

  const result = await resend.emails.send({
    from,
    to: [to],
    subject: subjectLine,
    text,
    react: (
      <TransactionalMessageEmail bodyText={text} subjectLine={subjectLine} />
    ),
    ...(replyTo ? { replyTo: [replyTo] } : {}),
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
  if (!result.data?.id) {
    throw new Error("Resend did not return an email id.");
  }

  return { id: result.data.id };
}
