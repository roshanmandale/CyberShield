const OpenAI = require('openai');

const generateComplaintDraft = async (req, res) => {
    const { description, language, crimeType } = req.body;

    if (!description || !language || !crimeType) {
        return res.status(400).json({ message: "Please provide description, language, and crimeType" });
    }

    if (!process.env.NVIDIA_API_KEY) {
        return res.status(500).json({ message: "AI Configuration Missing." });
    }

    try {
        const openai = new OpenAI({
            apiKey: process.env.NVIDIA_API_KEY,
            baseURL: 'https://integrate.api.nvidia.com/v1',
            maxRetries: 0,
            timeout: 30000 // 30 second strict limit
        });

        const prompt = `You are a highly analytical structural legal assistant. Return ONLY a valid JSON object.
Analyze the following cyber crime description and output a structured complaint.
Input Language: ${language}. Output Language MUST BE ${language}.
Crime Type: ${crimeType}
Description: "${description}"

Requirements:
- Return ONLY JSON.
- No Markdown.
- No \`\`\`json fences.
- No explanation before or after the JSON.
- Use valid JSON syntax.
- Escape quotes correctly.
- Use the selected language.
- Use ONLY facts provided by the user.
- Never invent names, dates, transaction IDs, phone numbers, addresses or other facts.
- If information is missing, say "Not provided" in the appropriate field.
- Preserve the user's financial amount.
- Generate a factual formal complaint DRAFT.
- Do not claim that an FIR has been officially registered.
- Do not provide legal conclusions.

You must reply with exactly this JSON structure and absolutely nothing else:
{
  "title": "...",
  "crimeType": "...",
  "incidentSummary": "...",
  "suspectedMethod": "...",
  "financialLoss": "...",
  "requestedAction": "...",
  "complaintDraft": "..."
}`;

        console.log('[NVIDIA AI] Request started');
        const response = await openai.chat.completions.create({
            model: "meta/llama-3.1-8b-instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 1024
        });
        console.log('[NVIDIA AI] Response received');

        let rawCompletion = response.choices[0].message.content;
        rawCompletion = rawCompletion.replace(/```json/gi, '').replace(/```/g, '').trim();

        let jsonOut;
        try {
            jsonOut = JSON.parse(rawCompletion);
        } catch (parseErr) {
            console.error('[NVIDIA AI] JSON Parse Error');
            return res.status(502).json({ message: "AI returned an invalid structured response. Please try again." });
        }

        const requiredFields = ['title', 'crimeType', 'incidentSummary', 'suspectedMethod', 'financialLoss', 'requestedAction', 'complaintDraft'];
        for (const field of requiredFields) {
            if (!jsonOut[field]) {
                console.error(`[NVIDIA AI] Validation Error: Missing field ${field}`);
                return res.status(502).json({ message: "AI returned an invalid structured response. Please try again." });
            }
        }

        console.log('[NVIDIA AI] JSON parsed successfully');
        return res.status(200).json(jsonOut);

    } catch (error) {
        console.error("[NVIDIA AI] Error Details:", error.message || error);
        res.status(500).json({ message: "Error generating draft via AI", error: "Internal Server Error" });
    }
};

module.exports = { generateComplaintDraft };
