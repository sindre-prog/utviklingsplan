type ResendErrorBody = {
  message?: unknown;
};

export function classifyResendFailure(result: unknown, status: number, fallback: string) {
  const providerMessage = typeof result === "object" && result !== null
    && typeof (result as ResendErrorBody).message === "string"
    ? String((result as ResendErrorBody).message).trim()
    : String(status);
  const normalized = providerMessage.toLowerCase();

  if (
    normalized.includes("not authorized to send emails from")
    || normalized.includes("domain is not verified")
    || normalized.includes("domain mismatch")
  ) {
    return {
      providerMessage,
      userMessage: "E-postavsenderen er ikke autorisert. Kontakt ansvarlig for portalen.",
    };
  }

  if (
    normalized.includes("api key is invalid")
    || normalized.includes("restricted to only send emails")
    || status === 401
    || status === 403
  ) {
    return {
      providerMessage,
      userMessage: "E-posttjenesten er ikke riktig konfigurert. Kontakt ansvarlig for portalen.",
    };
  }

  if (status === 429) {
    return {
      providerMessage,
      userMessage: "E-posttjenesten har for mange forespørsler akkurat nå. Vent litt og prøv igjen.",
    };
  }

  return { providerMessage, userMessage: fallback };
}
