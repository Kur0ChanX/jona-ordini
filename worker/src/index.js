export default {
  async fetch(request) {
    const url = new URL(request.url);
    const cors = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (url.pathname === "/salute") {
      return new Response(JSON.stringify({ ok: true, servizio: "jona-notifiche" }), {
        headers: { "content-type": "application/json", ...cors },
      });
    }
    return new Response("Non trovato", { status: 404, headers: cors });
  },
};
