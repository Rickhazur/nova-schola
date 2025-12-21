// services/openai.ts
// Client-side service to interact with the /api/chat proxy

// Helper for non-streaming calls
async function callChatApi(messages: any[], model: string = "gpt-4o", jsonMode: boolean = false) {
    try {
        const body: any = {
            messages,
            model,
        };

        if (jsonMode) {
            body.response_format = { type: "json_object" };
        }

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("OpenAI Call Failed:", error);
        throw error;
    }
}

// 1. OpenAITutorSession (for Live Classroom)
export class OpenAITutorSession {
    apiKey: string;
    systemPrompt: string;
    messages: any[] = [];
    onMessage: (event: { type: 'text' | 'function_call', text?: string, function?: any }) => void = () => { };

    constructor(apiKey: string, systemPrompt: string) {
        this.apiKey = apiKey;
        this.systemPrompt = systemPrompt;
        this.messages.push({ role: 'system', content: systemPrompt });
    }

    async connect() {
        console.log("OpenAI Session Connected");
        return true;
    }

    async sendMessage(text: string) {
        this.messages.push({ role: 'user', content: text });

        try {
            const body = {
                messages: this.messages,
                model: "gpt-4o",
                tools: [{
                    type: "function",
                    function: {
                        name: "updateWhiteboard",
                        description: "Update the whiteboard with a visual explanation.",
                        parameters: {
                            type: "object",
                            properties: {
                                topic: { type: "string" },
                                svg_code: { type: "string", description: "SVG representation" }
                            },
                            required: ["topic", "svg_code"]
                        }
                    }
                }]
            };

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            const choice = data.choices?.[0];

            if (choice) {
                const msg = choice.message;
                this.messages.push(msg);

                if (msg.content) {
                    this.onMessage({ type: 'text', text: msg.content });
                }

                if (msg.tool_calls) {
                    for (const toolCall of msg.tool_calls) {
                        if (toolCall.function.name === 'updateWhiteboard') {
                            const args = JSON.parse(toolCall.function.arguments);
                            this.onMessage({
                                type: 'function_call',
                                function: { name: 'updateWhiteboard', args }
                            });
                        }
                    }
                }
            }

        } catch (e) {
            console.error("Tutor Session Error:", e);
        }
    }
}

// 2. Stream Consultation (for AI Consultant)
export async function* streamConsultation(
    history: any[],
    prompt: string,
    image?: string,
    useSearch: boolean = false
) {
    const messages = [...history];
    let content: any = prompt;

    if (image) {
        content = [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: image } }
        ];
    }
    messages.push({ role: 'user', content });

    if (useSearch) {
        messages.push({ role: 'system', content: "[CONTEXT] User requested web search. (Functionality assumed handled by model knowledge for now)." });
    }

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model: 'gpt-4o',
                stream: true
            })
        });

        if (!response.body) throw new Error('No response body');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                    const dataStr = line.trim().slice(6);
                    if (dataStr === '[DONE]') return;
                    try {
                        const data = JSON.parse(dataStr);
                        const content = data.choices?.[0]?.delta?.content;
                        if (content) yield { text: content };
                    } catch (e) { }
                }
            }
        }
    } catch (e) {
        console.error("Stream Error:", e);
        yield { text: "\n[Error de conexión]" };
    }
}

// 3. Career Guidance
export async function generateCareerGuidance(mode: 'TEEN' | 'KIDS', profile: string) {
    const sysPrompt = `Act as a Career Counselor for ${mode === 'TEEN' ? 'High School Students' : 'Primary School Kids'}. Return JSON.`;
    const userPrompt = `Profile: ${profile}. Generate 3 career options. Structure: { careers: [{ title, description, match, roadmap (if TEEN), salary (if TEEN), superpowers (if KIDS), emoji (if KIDS) }] }`;

    const data = await callChatApi(
        [{ role: "system", content: sysPrompt }, { role: "user", content: userPrompt }],
        "gpt-4o",
        true
    );
    return JSON.parse(data.choices[0].message.content);
}

// 4. Diagnostic Test Eval
export async function evaluateMathDiagnostic(studentName: string, questions: any[], workImage?: string) {
    const sysPrompt = "Act as a Math Teacher. Evaluate the diagnostic test and handwritten work. Return JSON.";

    const content: any[] = [{ type: "text", text: `Student: ${studentName}. Questions & Answers: ${JSON.stringify(questions)}` }];
    if (workImage) {
        content.push({ type: "image_url", image_url: { url: workImage } });
    }

    const data = await callChatApi(
        [{ role: "system", content: sysPrompt }, { role: "user", content: content }],
        "gpt-4o",
        true
    );

    // Expected structure: { score, feedback, gaps, remedialClasses: [{ title, topic }] }
    return JSON.parse(data.choices[0].message.content);
}

// 5. Remedial Plan
export async function generateRemedialPlan(reportText: string) {
    const sysPrompt = "Act as an Educational Strategist. Create a remedial plan based on the teacher's report. Return JSON matching the Subject interface structure (id, name, tracks[0].modules[0].classes...).";
    const data = await callChatApi(
        [{ role: "system", content: sysPrompt }, { role: "user", content: reportText }],
        "gpt-4o",
        true
    );
    return JSON.parse(data.choices[0].message.content);
}

// 6. Flashcards
export async function generateFlashcards(topic: string) {
    const sysPrompt = "Create 5 educational flashcards. Return JSON: { cards: [{ front, back }] }";
    const data = await callChatApi(
        [{ role: "system", content: sysPrompt }, { role: "user", content: `Topic: ${topic}` }],
        "gpt-4o",
        true
    );
    const json = JSON.parse(data.choices[0].message.content);
    return json.cards || [];
}

// 7. Parent Email Report
export async function generateParentEmailReport(studentName: string, data: any) {
    const sysPrompt = "Write a polite email to parents summarizing the student's progress.";
    const userPrompt = `Student: ${studentName}. Data: ${JSON.stringify(data)}`;

    const completion = await callChatApi(
        [{ role: "system", content: sysPrompt }, { role: "user", content: userPrompt }],
        "gpt-4o"
    );
    return completion.choices[0].message.content;
}

// Legacy export if needed, but discouraged
export async function callApi(endpoint: string, body: any) {
    // Maps legacy calls to new structure if possible, or just passes through
    // For now, simpler to just error or try to handle if we missed something.
    console.warn("Legacy callApi used for:", endpoint);
    return {};
}