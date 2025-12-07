const axios = require("axios");
const logger = require("../utils/logger");

const confluence = axios.create({
  baseURL: `${process.env.CONFLUENCE_BASE_URL}/wiki/rest/api`,
  auth: {
    username: process.env.CONFLUENCE_EMAIL,
    password: process.env.CONFLUENCE_API_TOKEN,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ CREATE page
exports.create = async (title, htmlContent) => {
  try {
    const res = await confluence.post("/content", {
      type: "page",
      title: title,
      space: { key: process.env.CONFLUENCE_SPACE_KEY },
      body: {
        storage: {
          value: htmlContent,
          representation: "storage",
        },
      },
    });

    return res.data.id;
  } catch (err) {
    logger.error("❌ Confluence create failed");
    logger.error(err.response?.data || err);
    throw err;
  }
};

// ✅ UPDATE page (version-aware)
exports.update = async (pageId, htmlContent) => {
  try {
    // 1️⃣ Fetch current page to get version
    const pageRes = await confluence.get(`/content/${pageId}?expand=version,title`);

    const currentVersion = pageRes.data.version.number;
    const title = pageRes.data.title;

    // 2️⃣ Update with incremented version
    await confluence.put(`/content/${pageId}`, {
      id: pageId,
      type: "page",
      title: title,
      version: {
        number: currentVersion + 1,
      },
      body: {
        storage: {
          value: htmlContent,
          representation: "storage",
        },
      },
    });
  } catch (err) {
    logger.error("❌ Confluence update failed");
    logger.error(err.response?.data || err);
    throw err;
  }
};
