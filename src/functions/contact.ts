
import { Env } from "./counter";

// Character limits for form fields
const LIMITS = {
    name: { min: 2, max: 100 },
    email: { min: 5, max: 254 },
    message: { min: 10, max: 2000 },
};

// Simple XSS sanitization - removes HTML tags and encodes special characters
function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, "") // Remove angle brackets
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .trim();
}

// Validate email format
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

interface ValidationResult {
    valid: boolean;
    error?: string;
}

function validateForm(data: {
    name: string;
    email: string;
    message: string;
    honeypot?: string;
    timestamp?: number;
}): ValidationResult {
    // Bot protection: honeypot field should be empty
    if (data.honeypot && data.honeypot.length > 0) {
        return { valid: false, error: "Bot detected" };
    }

    // Bot protection: form should take at least 3 seconds to fill
    if (data.timestamp) {
        const timeTaken = Date.now() - data.timestamp;
        if (timeTaken < 3000) {
            return { valid: false, error: "Form submitted too quickly" };
        }
    }

    // Validate name
    if (!data.name || data.name.length < LIMITS.name.min) {
        return { valid: false, error: `Name must be at least ${LIMITS.name.min} characters` };
    }
    if (data.name.length > LIMITS.name.max) {
        return { valid: false, error: `Name must be less than ${LIMITS.name.max} characters` };
    }

    // Validate email
    if (!data.email || !isValidEmail(data.email)) {
        return { valid: false, error: "Please provide a valid email address" };
    }
    if (data.email.length > LIMITS.email.max) {
        return { valid: false, error: `Email must be less than ${LIMITS.email.max} characters` };
    }

    // Validate message
    if (!data.message || data.message.length < LIMITS.message.min) {
        return { valid: false, error: `Message must be at least ${LIMITS.message.min} characters` };
    }
    if (data.message.length > LIMITS.message.max) {
        return { valid: false, error: `Message must be less than ${LIMITS.message.max} characters` };
    }

    return { valid: true };
}

export async function handleContact(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
    // Only allow POST requests
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const body: any = await request.json();

        // Validate the form data
        const validation = validateForm(body);
        if (!validation.valid) {
            return new Response(JSON.stringify({ error: validation.error }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Sanitize inputs to prevent XSS
        const sanitizedData = {
            name: sanitizeInput(body.name),
            email: sanitizeInput(body.email),
            message: sanitizeInput(body.message),
            submittedAt: new Date().toISOString(),
            ip: request.headers.get("CF-Connecting-IP") || "unknown",
        };

        // Store the message in Cloudflare KV
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // Store in KV
        await env.AUTOFIX_DATA.put(`contact:${messageId}`, JSON.stringify(sanitizedData));

        return new Response(
            JSON.stringify({
                success: true,
                message: "Your message has been received. We'll get back to you soon!"
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Contact form error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to process your message. Please try again." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
