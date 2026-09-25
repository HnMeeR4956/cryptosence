// Use HTTPS: Render's free instances block the standard SMTP ports.
const sendEmail = async (options) => {
  const apiKey = process.env.BREVO_API_KEY;
  const email = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !email) {
    throw new Error("Brevo email configuration is missing");
  }
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      sender: { email, name: process.env.BREVO_SENDER_NAME || "CryptoSence" },
      to: [{ email: options.email }],
      subject: options.subject,
      textContent: options.message,
    }),
  });
  if (!response.ok) {
    // Do not expose provider responses, credentials, or reset links.
    throw new Error("Brevo email request failed (HTTP " + response.status + ")");
  }
  const result = await response.json();
  if (!result.messageId) throw new Error("Brevo did not confirm email acceptance");
  return result.messageId;
};
module.exports = sendEmail;
