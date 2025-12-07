// services/pageResolverService.js
const repo = require("../repositories/flowPageRepository");

exports.resolve = async (flow, project) => {
  const existing = await repo.findByFlow(flow.name, project.id);

  if (existing) {
    return { action: "UPDATE", pageId: existing.confluence_page_id };
  }

  return { action: "CREATE" };
};

