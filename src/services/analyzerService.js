const llmService = require("./llmService");
const gitlabService = require("./gitlabService");
const confluenceService = require("./confluenceService");
const dbService = require("./dbService");
const logger = require("../utils/logger");

// 🔴 TURN THIS ON later when you have OpenAI key
const USE_LLM = false;

exports.processMergeRequest = async (payload) => {
  logger.info(`🚀 Processing MR ${payload.mr_id}`);

  // 1️⃣ Expand code context (diff + related files)
  const codeContext = await gitlabService.expandContext(payload);

  // 2️⃣ Identify impacted flows
  let flows;

  if (USE_LLM) {
    flows = await llmService.identifyFlows(codeContext);
  } else {
    // ✅ MOCKED response for now
    flows = [
      {
        name: "GitLab Webhook Receiver Flow",
        description: "Handles GitLab merge request webhooks",
      },
    ];

    logger.info("⚠️ Using mocked LLM response");
  }

  // 3️⃣ For each impacted flow
  for (const flow of flows) {
    logger.info(`🔍 Checking flow: ${flow.name}`);

    // ✅ THIS IS WHERE DB IS QUERIED
    const existingPage = await dbService.findFlow(flow.name);

    // ✅ THIS IS THE LINE YOU ASKED ABOUT
    const action = existingPage ? "update" : "create";

    logger.info(`🧠 Documentation action decided: ${action}`);

    // 4️⃣ Generate documentation
    let documentation;

    if (USE_LLM) {
      documentation = await llmService.generateDocumentation({
        flow,
        context: codeContext,
        action,
      });
    } else {
      documentation = `
<h2>${flow.name}</h2>
<p><b>Action:</b> ${action}</p>
<p>This documentation is generated in mock mode.</p>

<h3>Files Changed</h3>
<ul>
  ${payload.changes.map(c => `<li>${c.new_path}</li>`).join("")}
</ul>
      `;
    }

    // 5️⃣ Write to Confluence
    if (existingPage) {
      logger.info(`✏️ Updating Confluence page ${existingPage.pageId}`);
      await confluenceService.update(existingPage.pageId, documentation);
    } else {
      logger.info(`📄 Creating new Confluence page for ${flow.name}`);
      const pageId = await confluenceService.create(flow.name, documentation);

      // ✅ SAVE MAPPING so next MR updates instead of creates
      await dbService.saveFlow(flow.name, pageId);
    }
  }

  logger.info(`✅ Analysis completed for MR ${payload.mr_id}`);
};
