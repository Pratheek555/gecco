type Attachment = {
  filename: string;
  content: Uint8Array;
};

type Email = {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: Attachment[];
};

/**
 * Sends transactional email through Resend's HTTP API. Without RESEND_API_KEY,
 * development logs the message instead so flows can be tested locally.
 */
export async function sendEmail(email: Email) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not configured.");
    }
    const attached = email.attachments?.map((file) => `${file.filename} (${file.content.byteLength} bytes)`).join(", ");
    console.info(`[mailer] Email to ${email.to}: ${email.subject}${attached ? ` [attached: ${attached}]` : ""}\n${email.text}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Gecco <no-reply@gecco.in>",
      to: [email.to],
      subject: email.subject,
      text: email.text,
      html: email.html,
      attachments: email.attachments?.map((file) => ({
        filename: file.filename,
        content: Buffer.from(file.content).toString("base64"),
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Email provider responded with ${response.status}: ${await response.text()}`);
  }
}
