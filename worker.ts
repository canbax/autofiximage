
import { handleCounter, Env } from "./src/functions/counter";
import { handleContact } from "./src/functions/contact";

export default {
    async fetch(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        try {
            if (url.pathname.startsWith("/api/counter")) {
                return handleCounter(request, env);
            }

            if (url.pathname.startsWith("/api/contact")) {
                return handleContact(request, env, context);
            }

            // Serve static assets or fall through
            // Since 'assets' is defined in wrangler.jsonc, requests for static files
            // should generally be handled by Cloudflare before hitting this worker
            // if configured as a Service/Worker with Assets. 
            // However, for SPA fallback or if assets are not found, we might need logic here.
            // But typically, if we don't return a response, we might want to return 404 or let it fall through.
            // With 'assets' binding, usually we can just return env.ASSETS.fetch(request) if using the new Assets system,
            // OR if using the older 'site' or just 'assets' key in toplvl, it's often automatic.
            // Let's assume standard Workers behavior: we handle API, everything else is 404 from API perspective
            // or handled by the platform's asset serving if no worker route matches.
            // Since we defined 'main' as worker.ts, ALL requests hit this worker.
            // If we want to serve assets, we should ideally not block them if not API.
            // But if 'assets' configuration is present, 'wrangler dev' serves assets.

            // Let's return a 404 for unknown API routes, but for non-API, we probably want to let
            // the asset serving take over, or return the index.html for SPA.
            // Since we don't have direct access to 'env.ASSETS' without proper binding type,
            // and 'assets' config in wrangler usually means static serving...

            // Safest bet for now:
            return new Response("Not Found", { status: 404 });

        } catch (e) {
            return new Response("Internal Error", { status: 500 });
        }
    },
};
