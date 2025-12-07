const axios = require("axios");
const logger = require("../utils/logger");

const BASE_URL = process.env.CONFLUENCE_BASE_URL;
// example: https://rachittech927.atlassian.net/wiki
const SPACE_KEY = process.env.CONFLUENCE_SPACE_KEY;

const client = axios.create({
  baseURL: BASE_URL,
  auth: {
    username: process.env.CONFLUENCE_EMAIL,
    password: process.env.CONFLUENCE_API_TOKEN
  },
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 5000
});

exports.createPage = async (title, htmlContent) => {
  try {
    const res = await client.post("/rest/api/content", {
      type: "page",
      title,
      space: {
        key: SPACE_KEY
      },
      body: {
        storage: {
          value: htmlContent,
          representation: "storage"
        }
      }
    });

    logger.info(`✅ Confluence page created: ${res.data.id}`);
    return res.data.id;

  } catch (err) {
    logger.error("❌ Confluence createPage failed", err.response?.data || err);
    throw err;
  }
};

exports.updatePage = async (pageId, title, htmlContent, version) => {
  try {
    const res = await client.put(`/rest/api/content/${pageId}`, {
      id: pageId,
      type: "page",
      title,
      version: {
        number: version + 1
      },
      body: {
        storage: {
          value: htmlContent,
          representation: "storage"
        }
      }
    });

    logger.info(`✅ Confluence page updated: ${pageId}`);
    return res.data.id;

  } catch (err) {
    logger.error("❌ Confluence updatePage failed", err.response?.data || err);
    throw err;
  }
};
