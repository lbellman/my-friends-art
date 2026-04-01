import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import {
  emailTheme,
  emailWebFonts,
  getEmailSiteUrl,
} from "@/lib/email/email-theme";

type EmailLayoutProps = {
  /** Inbox preview line (keep short) */
  preview: string;
  /** Shown under the brand line (e.g. email subject) */
  heading?: string;
  children: React.ReactNode;
};

export function EmailLayout({ preview, heading, children }: EmailLayoutProps) {
  const siteUrl = getEmailSiteUrl();
  const logoUrl = `${siteUrl}/logo-small.png`;

  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        {/* Embed @font-face — external stylesheets are often stripped in email clients */}
        <Font
          fontFamily="Lacquer"
          fallbackFontFamily={["Georgia", "serif"]}
          webFont={{
            url: emailWebFonts.lacquer.woff2,
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Outfit"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          webFont={{
            url: emailWebFonts.outfit.woff2,
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          backgroundColor: emailTheme.pageBg,
          fontFamily: emailTheme.fontSans,
        }}
      >
        <Section style={{ padding: "28px 16px 40px" }}>
          <Container
            style={{
              maxWidth: 560,
              margin: "0 auto",
              backgroundColor: emailTheme.cardBg,
              borderRadius: 12,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: emailTheme.border,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(70, 50, 60, 0.06)",
            }}
          >
            <Section
              style={{
                height: 4,
                backgroundColor: emailTheme.accentBar,
                lineHeight: 0,
              }}
            />
            <Section style={{ padding: "28px 32px 8px" }}>
              <Link href={siteUrl} style={{ textDecoration: "none" }}>
                <Img
                  src={logoUrl}
                  alt="My Friend's Art"
                  width={52}
                  height={52}
                  style={{
                    borderRadius: 8,
                    display: "block",
                    marginBottom: 16,
                  }}
                />
              </Link>
              <Heading
                as="h1"
                style={{
                  fontFamily: emailTheme.fontDisplay,
                  fontSize: 28,
                  fontWeight: 400,
                  lineHeight: 1.15,
                  letterSpacing: "0.04em",
                  color: emailTheme.primaryForeground,
                  margin: "0 0 12px",
                }}
              >
                My Friend&apos;s Art
              </Heading>
              {heading ? (
                <Text
                  style={{
                    fontFamily: emailTheme.fontSans,
                    fontSize: 15,
                    fontWeight: 600,
                    color: emailTheme.foreground,
                    margin: "0 0 20px",
                    lineHeight: "22px",
                  }}
                >
                  {heading}
                </Text>
              ) : null}
            </Section>
            <Section style={{ padding: "8px 32px 28px" }}>{children}</Section>
            <Hr
              style={{
                borderWidth: 0,
                borderTopWidth: 1,
                borderStyle: "solid",
                borderColor: emailTheme.border,
                margin: 0,
              }}
            />
            <Section style={{ padding: "20px 32px 24px" }}>
              <Text
                style={{
                  fontFamily: emailTheme.fontSans,
                  fontSize: 12,
                  color: emailTheme.foregroundMuted,
                  lineHeight: "18px",
                  margin: 0,
                }}
              >
                Made by someone&apos;s friend.{" "}
                <Link
                  href={siteUrl}
                  style={{
                    color: emailTheme.primaryForeground,
                    fontWeight: 500,
                  }}
                >
                  myfriendsart.ca
                </Link>
              </Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}
