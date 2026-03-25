import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/send-transactional";

const MAX_SUBJECT = 500;
const MAX_MESSAGE = 100_000;

function isLikelyEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = String((body as Record<string, unknown>)?.name ?? "").slice(
    0,
    200,
  );
  const fromEmail = String(
    (body as Record<string, unknown>)?.fromEmail ?? "",
  ).slice(0, 320);
  const toEmail = String(
    (body as Record<string, unknown>)?.toEmail ?? "",
  ).trim();
  const subject = String(
    (body as Record<string, unknown>)?.subject ?? "",
  ).slice(0, MAX_SUBJECT);
  const message = String(
    (body as Record<string, unknown>)?.message ?? "",
  ).slice(0, MAX_MESSAGE);

  if (!toEmail || !isLikelyEmail(toEmail)) {
    return NextResponse.json(
      { error: "A valid recipient email is required." },
      { status: 400 },
    );
  }
  if (!subject.trim()) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }
  if (!message.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }
  if (fromEmail && !isLikelyEmail(fromEmail)) {
    return NextResponse.json(
      { error: "Sender email is invalid." },
      { status: 400 },
    );
  }

  try {
    const { id } = await sendTransactionalEmail({
      name,
      fromEmail,
      toEmail,
      subject,
      message,
    });
    return NextResponse.json({ id }, { status: 200 });
  } catch (err) {
    console.error("send-email:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to send email.",
      },
      { status: 500 },
    );
  }
}
