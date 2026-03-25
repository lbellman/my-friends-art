import { Text } from "@react-email/components";
import { EmailLayout } from "@/app/emails/EmailLayout";
import { emailTheme } from "@/lib/email/email-theme";

export type TransactionalMessageEmailProps = {
  /** Full plain-text body (may include sender lines + message) */
  bodyText: string;
  /** Shown in the layout header — usually the same as the email subject */
  subjectLine: string;
};

/**
 * Default transactional template: branded shell + preformatted body.
 * Used for every Resend send from `sendTransactionalEmail`.
 */
export function TransactionalMessageEmail({
  bodyText,
  subjectLine,
}: TransactionalMessageEmailProps) {
  const preview =
    bodyText.replace(/\s+/g, " ").trim().slice(0, 110) ||
    subjectLine.slice(0, 110);

  return (
    <EmailLayout preview={preview} heading={subjectLine}>
      <Text
        style={{
          fontFamily: emailTheme.fontSans,
          fontSize: 15,
          lineHeight: "24px",
          color: emailTheme.foreground,
          margin: 0,
          whiteSpace: "pre-wrap",
        }}
      >
        {bodyText}
      </Text>
    </EmailLayout>
  );
}
