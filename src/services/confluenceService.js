const axios = require("axios");
const logger = require("../utils/logger");

const confluenceApi = axios.create({
  baseURL: process.env.CONFLUENCE_BASE_URL, 
  auth: {
    username: process.env.CONFLUENCE_EMAIL,
    password: process.env.CONFLUENCE_API_TOKEN,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

exports.createPage = async (title, content) => {
  logger.info(`📄 Creating Confluence page: ${title}`);

  const res = await confluenceApi.post("/rest/api/content", {
    type: "page",
    title,
    space: {
      key: "SD", // ✅ FIX IS HERE
    },
    body: {
      storage: {
        value: content,
        representation: "storage",
      },
    },
  });

  return res.data.id;
};

exports.updatePage = async (pageId, title, content, version) => {
  logger.info(`✏️ Updating Confluence page: ${pageId}`);

  await confluenceApi.put(`/rest/api/content/${pageId}`, {
    id: pageId,
    type: "page",
    title,
    version: {
      number: version + 1,
    },
    body: {
      storage: {
        value: content,
        representation: "storage",
      },
    },
  });
};
