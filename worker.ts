
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

            // Handle language routes and static assets
            if (env.ASSETS) {
                const response = await env.ASSETS.fetch(request);
                if (response.status === 404) {
                    // Start of SPA Fallback logic
                    // If the request is for a file (has extension), return 404
                    if (url.pathname.split('/').pop()?.includes('.')) {
                        return response;
                    }
                    // Otherwise, serve index.html for client-side routing
                    return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
                }
                return response;
            }

            return new Response("Not Found", { status: 404 });

        } catch (e) {
            return new Response("Internal Error", { status: 500 });
        }
    },
};
