import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
const app = express();
app.use(express.json());
app.use(cors());
import dotenv from 'dotenv';
dotenv.config();
const Disposable_Domains = new Set([
    '10minutemail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com'
]);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
async function checkDomain(domain) {
    try {
        const respose = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=MX`, {
            headers: { "accept": "application/dns-json" }
        });
        if (!respose.ok) {
            return false;
        }
        const data = await respose.json();
        return data.Answer && data.Answer.some(record => record.type === 15);
    }
    catch (err) {
        console.log("Mx check error", err);
        return false;
    }
}
async function analyzeDomainWithAI(domain) {
    const prompt = `Analyze the email domain "${domain}". Respond with ONLY a raw JSON object with two keys: "provider" and "category".
        - "provider": The email service provider (e.g., "Google Workspace", "Microsoft 365", "Public Gmail").
        - "category": The category of the email ("Business/Corporate", "Public/Personal", "Disposable/Temporary").
        Do not include markdown formatting like \`\`\`json or any explanatory text.`;
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    };
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            // It's helpful to log the response body for more details on the error
            const errorBody = await response.text();
            console.error("API Error Body:", errorBody);
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        // **THE FIX IS HERE**
        // 1. Correctly access the text from the API response.
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
            throw new Error("Invalid or empty response from AI model.");
        }
        // 2. Since we requested "application/json", we can directly parse the text.
        const parsedJson = JSON.parse(rawText);
        // 3. Return the properties from the parsed JSON object.
        return {
            provider: parsedJson.provider ?? 'Unknown',
            category: parsedJson.category ?? 'Unknown',
        };
    }
    catch (err) {
        console.error("AI Analysis Error:", err);
        return { provider: "Unknown", category: "Unknown" };
    }
}
app.post('/api/check-email', async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
            error: "a valid email address is required."
        });
    }
    const domain = email.split('@')[1];
    if (!domain) {
        return res.status(400).json({
            error: "Invalid email address"
        });
    }
    try {
        const [hasMx, isDisposable, aianalysis] = await Promise.all([
            checkDomain(domain),
            Promise.resolve(Disposable_Domains.has(domain)),
            analyzeDomainWithAI(domain)
        ]);
        let finalCategory = aianalysis.category;
        console.log(finalCategory);
        if (isDisposable) {
            finalCategory = "Disposable/Temporary";
        }
        const result = {
            email,
            domain,
            isValid: hasMx && !isDisposable,
            details: {
                hasMx,
                isDisposable,
                provider: aianalysis.provider,
                category: finalCategory
            }
        };
        console.log(aianalysis);
        res.status(200).json(result);
    }
    catch (error) {
        console.log('server error', error);
        res.status(500).json({ error: 'an internal server error occurred' });
    }
});
app.listen(3000);
//# sourceMappingURL=index.mjs.map