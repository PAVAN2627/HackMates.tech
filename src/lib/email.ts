interface MailPayload {
  email: string;
  subject: string;
  message?: string;
  html?: string;
}

interface MailResponse {
  success?: boolean;
  error?: string;
}

const emailServiceUrl = import.meta.env.VITE_APPS_SCRIPT_WEB_APP_URL;

export async function sendPlatformEmail(payload: MailPayload) {
  if (!emailServiceUrl) {
    throw new Error("VITE_APPS_SCRIPT_WEB_APP_URL is not configured.");
  }

  const parseResponse = async (response: Response) => {
    if (!response.ok) {
      throw new Error(`Email service request failed with status ${response.status}.`);
    }

    let result: MailResponse | null = null;
    try {
      result = (await response.json()) as MailResponse;
    } catch {
      result = null;
    }

    if (result?.success === false) {
      throw new Error(result.error || "Email service returned an error.");
    }

    return result;
  };

  const formBody = new URLSearchParams();
  formBody.set("email", payload.email);
  formBody.set("subject", payload.subject);
  if (payload.message) {
    formBody.set("message", payload.message);
  }
  if (payload.html) {
    formBody.set("html", payload.html);
  }

  try {
    // First attempt: send JSON with text/plain to avoid browser preflight,
    // while still allowing Apps Script handlers that use JSON.parse(postData.contents).
    const response = await fetch(emailServiceUrl, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    return parseResponse(response);
  } catch (plainJsonError) {
    // Fallback 1: form-encoded body for Apps Script handlers that read e.parameter.
    try {
      const formResponse = await fetch(emailServiceUrl, {
        method: "POST",
        mode: "cors",
        body: formBody,
      });

      return parseResponse(formResponse);
    } catch {
      // Fallback 2: explicit application/json for handlers configured for JSON + preflight support.
      const jsonResponse = await fetch(emailServiceUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify(payload),
      });

      return parseResponse(jsonResponse).catch(() => {
        if (plainJsonError instanceof Error) {
          throw plainJsonError;
        }
        throw new Error("Email request failed.");
      });
    }
  }
}
