
import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
    const store = getStore("analytics");
    const key = "image_downloads";

    try {
        if (req.method === "GET") {
            const count = await store.get(key, { type: "text" });
            return new Response(JSON.stringify({ count: parseInt(count || "0", 10) }), {
                headers: { "Content-Type": "application/json" },
            });
        } else if (req.method === "POST") {
            const currentCountStr = await store.get(key, { type: "text" });
            let currentCount = parseInt(currentCountStr || "0", 10);
            currentCount++;
            await store.set(key, currentCount.toString());
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
};

export const config: Config = {
    path: "/api/counter",
};
