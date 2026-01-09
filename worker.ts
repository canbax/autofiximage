
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

            // Attempt to serve asset
            try {
                const assetResponse = await env.ASSETS.fetch(request);
                if (assetResponse.status !== 404) {
                    return assetResponse;
                }
            } catch (e) {
                // Ignore asset fetch errors, proceed to fallback
            }

            // SPA Fallback: for non-API routes that weren't found in assets, 
            // serve index.html if it's a page request (accepts html)
            const accept = request.headers.get("Accept");
            if (accept && accept.includes("text/html")) {
                try {
                    const indexRequest = new Request(new URL("/", request.url), request);
                    return await env.ASSETS.fetch(indexRequest);
                } catch (e) {
                    return new Response("Not Found", { status: 404 });
                }
            }

            return new Response("Not Found", { status: 404 });

        } catch (e) {
            return new Response("Internal Error", { status: 500 });
        }
    },
};
