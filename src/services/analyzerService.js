const llmService = require("./llmService");
const gitlabService = require("./gitlabService");
const confluenceService = require("./confluenceService");
const dbService = require("./dbService");
const logger = require("../utils/logger");

exports.processMergeRequest = async (payload) => {
  logger.info(`🚀 Processing MR ${payload.mr_id}`);

  // 1️⃣ Expand code context (diff + related files)
  const codeContext = await gitlabService.expandContext(payload);

  // 2️⃣ Identify impacted flows (LLM or mock)
  const flows = await llmService.identifyFlows(codeContext);

  for (const flow of flows) {
    logger.info(`🔍 Processing flow: ${flow.name}`);

    // 3️⃣ Check DB if page already exists
    const existingPage = await dbService.findFlow(flow.name);

    // 4️⃣ Generate documentation content
    const documentation = await llmService.generateDocumentation({
      flow,
      context: codeContext,
      action: existingPage ? "update" : "create",
    });

    // 5️⃣ Write to Confluence ✅
    if (existingPage) {
      logger.info(`✏️ Updating existing Confluence page for ${flow.name}`);
      await confluenceService.update(existingPage.pageId, documentation);
    } else {
      logger.info(`📄 Creating new Confluence page for ${flow.name}`);
      const pageId = await confluenceService.create(
        flow.name,
        documentation
      );

      // 6️⃣ Save mapping in DB
      await dbService.saveFlow(flow.name, pageId);
    }
  }

  logger.info(`✅ Finished processing MR ${payload.mr_id}`);
};
