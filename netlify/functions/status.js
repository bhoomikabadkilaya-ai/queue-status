// netlify/functions/status.js
// Use the runtime's global fetch (Netlify Node supports fetch).
// Export the function as module.exports.handler so Netlify can find it.

module.exports.handler = async function (event, context) {
  const token = process.env.BLYNK_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing BLYNK_TOKEN" })
    };
  }

  async function readPin(pin) {
    try {
      const url = `https://blynk.cloud/external/api/get?token=${token}&pin=${pin}`;
      const r = await fetch(url);
      if (!r.ok) return null;
      const j = await r.json();
      return Array.isArray(j) ? j[0] : j;
    } catch (e) {
      return null;
    }
  }

  const [people, lastQ, workload, queueList, density] = await Promise.all([
    readPin("V0"),
    readPin("V1"),
    readPin("V2"),
    readPin("V3"),
    readPin("V5")
  ]);

  const payload = {
    people: people || 0,
    lastQueueNumber: lastQ || 0,
    workloadMinutes: workload || 0,
    density: density || "UNKNOWN",
    queueList: queueList || "No active orders"
  };

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
    body: JSON.stringify(payload)
  };
};
