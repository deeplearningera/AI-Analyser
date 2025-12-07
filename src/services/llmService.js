const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Identifies logical backend flows impacted by a Git diff
 * Returns structured JSON so analyzer logic stays deterministic
 */
exports.identifyFlows = async (context) => {
  const prompt = `
You are a senior backend architect.

From the Git diff and metadata below:
- Identify backend application flows impacted
- A "flow" is a user-visible or system-visible process
- Multiple flows may exist
- Utility-only changes without behavior change should be ignored

Return STRICT JSON only in this format:
[
  {
    "name": "flow_name",
    "confidence": 0.0-1.0,
    "files": ["file1.js"],
    "description": "why this flow is impacted"
  }
]

Input:
${JSON.stringify(context, null, 2)}
`;

  const res = await client.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  return JSON.parse(res.choices[0].message.content);
};

/**
 * Generates or updates documentation for a flow
 */
exports.generateDocumentation = async ({ flow, context, action }) => {
  const prompt = `
You are a technical documentation expert.

Task: ${action.toUpperCase()} documentation

Flow name: ${flow.name}

Rules:
- Be concise but complete
- Assume reader is a backend engineer
- Use headings and bullet points
- If updating, only describe what changed
- If creating, include overview + steps + edge cases

Relevant code context:
${JSON.stringify(context, null, 2)}
`;

  const res = await client.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  return res.choices[0].message.content;
};
