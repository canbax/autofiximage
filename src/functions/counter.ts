
export interface Env {
    AUTOFIX_DATA: KVNamespace;
}

export async function handleCounter(request: Request, env: Env): Promise<Response> {
    const key = "image_downloads";

    try {
        if (request.method === "GET") {
            const count = await env.AUTOFIX_DATA.get(key);
            return new Response(JSON.stringify({ count: parseInt(count || "0", 10) }), {
                headers: { "Content-Type": "application/json" },
            });
        } else if (request.method === "POST") {
            const currentCountStr = await env.AUTOFIX_DATA.get(key);
            let currentCount = parseInt(currentCountStr || "0", 10);
            currentCount++;
            await env.AUTOFIX_DATA.put(key, currentCount.toString());
            return new Response(JSON.stringify({ count: currentCount }), {
                headers: { "Content-Type": "application/json" },
            });
        } else {
            return new Response("Method Not Allowed", { status: 405 });
        }
    } catch (error) {
        console.error("Counter error:", error);
        return new Response(JSON.stringify({ error: "Failed to process counter" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
