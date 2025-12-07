const OpenAI = require("openai");
const logger = require("../utils/logger");

const LLM_ENABLED = process.env.LLM_ENABLED === "true";

let openai = null;

if (LLM_ENABLED) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Detect impacted backend flows
 */
exports.identifyFlows = async (codeContext) => {
  // ✅ STUB MODE
  if (!LLM_ENABLED) {
    logger.info("🧪 LLM disabled → returning mocked flows");

    return [
      {
        name: "Webhook Receiver Flow",
        type: "backend",
        files: ["webhookController.js"],
      },
    ];
  }

  // ✅ REAL MODE
  const prompt = `
Identify backend flows impacted by the following Git diff.
Return STRICT JSON.

${JSON.stringify(codeContext, null, 2)}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
  });

  return JSON.parse(res.choices[0].message.content);
};

/**
 * Generate documentation
 */
exports.generateDocumentation = async ({ flow, context, action }) => {
  // ✅ STUB MODE
  if (!LLM_ENABLED) {
    logger.info(`🧪 LLM disabled → returning mocked ${action} docs`);

    if (action === "create") {
      return `
# ${flow.name}

## Overview
This flow handles GitLab webhook events and forwards merge request data to downstream systems.

## Sequence
1. GitLab sends merge webhook
2. webhook-receiver validates payload
3. Payload sent to AI Analyzer

## Modified Files
${flow.files.join(", ")}
`;
    }

    // update case
    return `
## Update – ${flow.name}

- Minor formatting change detected
- No business logic impact
- Verified webhook response handling
`;
  }

  // ✅ REAL MODE
  const prompt = `
${action.toUpperCase()} technical documentation for flow ${flow.name}.
Explain only what changed.

${JSON.stringify(context, null, 2)}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
  });

  return res.choices[0].message.content;
};
