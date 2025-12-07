// src/services/analyzerService.js
const confluenceService = require('./confluenceService');
const logger = require('../utils/logger'); // Optional, replace with console if not using logger

/**
 * Process a single merge request and create documentation in Confluence
 * @param {Object} mr - Merge request object
 */
exports.processMergeRequest = async function (mr) {
  try {
    logger.info(`🔍 Processing MR ${mr.id}`);
    
    // Generate documentation content for Confluence
    const documentation = generateDocumentationHTML(mr);

    logger.info(`📄 Creating new Confluence page for ${mr.title}`);
    
    // Create Confluence page
    const pageId = await confluenceService.createPage(mr.title, documentation);

    logger.info(`✅ Confluence page created with ID: ${pageId}`);
    return pageId;
  } catch (error) {
    logger.error('❌ Error processing merge request:', error.message);
    throw error;
  }
};

/**
 * Analyze a merge request, optionally calling LLM or other tools
 * @param {Object} mr - Merge request object
 */
exports.analyzeMR = async function (mr) {
  try {
    // Example: return mocked flow if LLM is disabled
    const flows = mr.llmDisabled ? getMockedFlows() : await generateFlowsWithLLM(mr);

    for (const flow of flows) {
      await exports.processMergeRequest(flow);
    }

    return flows;
  } catch (error) {
    logger.error('❌ Error analyzing MR:', error.message);
    throw error;
  }
};

/**
 * Generate HTML content for Confluence page
 * @param {Object} mr - Merge request or flow object
 * @returns {string} HTML content in Confluence Storage format
 */
function generateDocumentationHTML(mr) {
  // You can enhance this HTML structure based on your requirements
  return `
    <h1>${mr.title}</h1>
    <p><strong>MR ID:</strong> ${mr.id}</p>
    <p><strong>Description:</strong> ${mr.description || 'No description provided'}</p>
    <h2>Flow Steps:</h2>
    <ul>
      ${mr.steps ? mr.steps.map(step => `<li>${step}</li>`).join('') : '<li>No steps available</li>'}
    </ul>
  `;
}

/**
 * Mocked flow generator (used if LLM is disabled)
 */
function getMockedFlows() {
  return [
    {
      id: 'mock-flow-1',
      title: 'Webhook Receiver Flow',
      description: 'This is a mocked flow for testing.',
      steps: ['Step 1', 'Step 2', 'Step 3'],
      llmDisabled: true,
    },
  ];
}

/**
 * Placeholder function to generate flows with LLM
 */
async function generateFlowsWithLLM(mr) {
  // TODO: Implement actual LLM logic
  return getMockedFlows(); // temporary
}
