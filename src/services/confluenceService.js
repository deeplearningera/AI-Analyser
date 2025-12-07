const axios = require("axios");
const logger = require("../utils/logger");

const {
  CONFLUENCE_BASE_URL,
  CONFLUENCE_SPACE_KEY,
  CONFLUENCE_AUTH_USERNAME,
  CONFLUENCE_AUTH_API_TOKEN,
} = process.env;

// ✅ Atlassian Cloud requires /wiki/rest/api
const confluence = axios.create({
  baseURL: `${CONFLUENCE_BASE_URL}/wiki/rest/api`,
  auth: {
    username: CONFLUENCE_AUTH_USERNAME,
    password: CONFLUENCE_AUTH_API_TOKEN,
  },
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

/**
 * ✅ Create a new Confluence page
 */
exports.create = async (title, htmlContent) => {
  logger.info(`📄 Creating new Confluence page: ${title}`);

  const res = await confluence.post("/content", {
    type: "page",
    title,
    space: {
      key: CONFLUENCE_SPACE_KEY, // ✅ MAA
    },
    body: {
      storage: {
        value: htmlContent,
        representation: "storage",
      },
    },
  });

  return res.data.id;
};

/**
 * ✅ Update existing Confluence page
 */
exports.update = async (pageId, htmlContent) => {
  logger.info(`✏️ Updating Confluence page: ${pageId}`);

  // Fetch current page to get version
  const existing = await confluence.get(`/content/${pageId}`);

  const updatedVersion = existing.data.version.number + 1;

  await confluence.put(`/content/${pageId}`, {
    id: pageId,
    type: "page",
    title: existing.data.title,
    version: {
      number: updatedVersion,
    },
    body: {
      storage: {
        value: htmlContent,
        representation: "storage",
      },
    },
  });
};
