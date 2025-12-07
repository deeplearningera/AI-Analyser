// services/confluenceService.js
exports.persistPage = async (decision, content, project, flow) => {
  if (decision.action === "CREATE") {
    console.log("📄 Creating Confluence page for", flow.name);
    return;
  }

  console.log("✏️ Updating Confluence page", decision.pageId);
};
