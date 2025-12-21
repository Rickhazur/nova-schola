
import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages, model, tools, tool_choice, response_format, stream } = req.body;

        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const streamResponse = await openai.chat.completions.create({
                model: model || "gpt-4o-mini",
                messages,
                tools,
                tool_choice,
                response_format,
                stream: true,
            });

            for await (const chunk of streamResponse) {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            }
            res.end();
        } else {
            const completion = await openai.chat.completions.create({
                model: model || "gpt-4o-mini",
                messages,
                tools,
                tool_choice,
                response_format,
            });

            return res.status(200).json(completion);
        }

    } catch (err: any) {
        console.error("OpenAI error:", err);
        return res.status(500).json({ error: "Error calling OpenAI", details: err.message });
    }
}
