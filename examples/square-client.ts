// PLANTED BAD CHANGE: do not merge. This PR exists to show the gates catching it.
// The token below is random characters in the shape of a Square access token. It was never
// issued by Square and grants no access. gitleaks should fail this PR on it.

const SQUARE_ACCESS_TOKEN = "EAAAXnjX1fop70DsA2BJEgnXbzT5uZy1xeuIMgkCVkEFW72j1BDc5WlSKpnVbgYd";

export async function createPayment(body: unknown) {
  return fetch("https://connect.squareup.com/v2/payments", {
    method: "POST",
    headers: { Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
