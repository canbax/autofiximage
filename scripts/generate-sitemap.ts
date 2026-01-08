import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../lib/i18n';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://autofiximage.com';

const ROUTES = [
    '',
    'about',
    'privacy',
    'terms',
    'contact',
];

function generateSitemap() {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    // Helper to get URL for a language and route
    const getUrl = (lang: string, route: string) => {
        const routePart = route ? `/${route}` : '';
        if (lang === DEFAULT_LANGUAGE) {
            // Default language is at root (e.g. domain.com/about)
            // But wait, our routing logic supports domain.com/fr/about
            // Does domain.com/en/about redirect to domain.com/about?
            // My routing implementation treats /en/ as valid link in Switcher.
            // But typically default language is root.
            // Let's stick to what LanguageSwitcher generates:
            // href={lang === 'en' ? '/' : `/${lang}/`}

            // So for 'en' and route 'about': /about
            // For 'fr' and route 'about': /fr/about

            if (route === '') return lang === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${lang}/`;

            return lang === 'en'
                ? `${BASE_URL}/${route}`
                : `${BASE_URL}/${lang}/${route}`;
        }
        // For specific sub-paths
        if (route === '') return `${BASE_URL}/${lang}/`;
        return `${BASE_URL}/${lang}/${route}`;
    };

    // Iterate over all languages and routes to generate URL entries
    for (const lang of LANGUAGES) {
        for (const route of ROUTES) {
            const loc = getUrl(lang, route);

            sitemap += '  <url>\n';
            sitemap += `    <loc>${loc}</loc>\n`;
            sitemap += `    <changefreq>weekly</changefreq>\n`;
            sitemap += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;

            // Add alternate links for all languages (including self)
            for (const altLang of LANGUAGES) {
                const altLoc = getUrl(altLang, route);
                sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altLoc}" />\n`;
            }
            // Add x-default (usually maps to default language)
            sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${getUrl('en', route)}" />\n`;

            sitemap += '  </url>\n';
        }
    }

    sitemap += '</urlset>';

    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    console.log('Sitemap generated successfully!');
}

generateSitemap();
