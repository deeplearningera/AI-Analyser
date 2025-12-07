// src/services/confluenceService.js
const axios = require('axios');

const CONFLUENCE_BASE_URL = process.env.CONFLUENCE_BASE_URL; // e.g., https://rachittech927.atlassian.net/wiki
const CONFLUENCE_EMAIL = process.env.CONFLUENCE_EMAIL; // your Atlassian email
const CONFLUENCE_API_TOKEN = process.env.CONFLUENCE_API_TOKEN; // API token from Atlassian
const CONFLUENCE_SPACE_KEY = process.env.CONFLUENCE_SPACE_KEY; // e.g., "MAA"
const CONFLUENCE_PARENT_PAGE_ID = process.env.CONFLUENCE_PARENT_PAGE_ID; // e.g., "393378"

if (!CONFLUENCE_BASE_URL || !CONFLUENCE_EMAIL || !CONFLUENCE_API_TOKEN || !CONFLUENCE_SPACE_KEY || !CONFLUENCE_PARENT_PAGE_ID) {
  throw new Error('Confluence environment variables are missing!');
}

/**
 * Create a new Confluence page under a specific space and parent page.
 * @param {string} title - Page title
 * @param {string} content - Page HTML content (Confluence Storage format)
 * @returns {Promise<string>} - Newly created page ID
 */
async function createPage(title, content) {
  try {
    const payload = {
      type: 'page',
      title: title,
      space: { key: CONFLUENCE_SPACE_KEY },
      ancestors: [{ id: CONFLUENCE_PARENT_PAGE_ID }],
      body: {
        storage: {
          value: content,
          representation: 'storage',
        },
      },
    };

    const response = await axios.post(
      `${CONFLUENCE_BASE_URL}/rest/api/content`,
      payload,
      {
        auth: {
          username: CONFLUENCE_EMAIL,
          password: CONFLUENCE_API_TOKEN,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.id; // Return the new page ID
  } catch (error) {
    console.error('Confluence API error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  createPage,
};
