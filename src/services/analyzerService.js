const llmService = require("./llmService");
const gitlabService = require("./gitlabService");
const confluenceService = require("./confluenceService");
const dbService = require("./dbService");
const logger = require("../utils/logger");

exports.processMergeRequest = async (payload) => {
  logger.info(`🔍 Processing MR ${payload.mr_id} (${payload.project.path})`);

  // 1️⃣ Expand Git context (diff + related files)
  const codeContext = await gitlabService.expandContext(payload);

  // 2️⃣ Identify impacted flows (LLM call inside)
  const flows = await llmService.identifyFlows(codeContext);

  if (!flows.length) {
    logger.info(`ℹ️ No documentable flows detected`);
    return;
  }

  for (const flow of flows) {
    try {
      const flowKey = flow.name.toLowerCase().replace(/\s+/g, "_");

      logger.info(`📐 Processing flow: ${flow.name}`);

      // 3️⃣ DB lookup
      const existingPage = await dbService.findFlow({
        flowName: flowKey,
        projectId: payload.project.id,
      });

      // 4️⃣ Generate documentation
      const doc = await llmService.generateDocumentation({
        flow,
        context: codeContext,
        action: existingPage ? "update" : "create",
      });

      // 5️⃣ Write to Confluence
      if (existingPage) {
        await confluenceService.update(existingPage.page_id, doc);

        await dbService.touchFlow(existingPage.id, {
          lastCommit: payload.last_commit_sha,
        });

        logger.info(`✏️ Updated Confluence page for ${flow.name}`);
      } else {
        const pageId = await confluenceService.create(flow.name, doc);

        await dbService.saveFlow({
          flowName: flowKey,
          pageId,
          projectId: payload.project.id,
          repo: payload.project.path,
          firstCommit: payload.last_commit_sha,
        });

        logger.info(`🆕 Created Confluence page for ${flow.name}`);
      }
    } catch (err) {
      logger.error(
        `❌ Failed processing flow ${flow.name}: ${err.message}`
      );
    }
  }
};
