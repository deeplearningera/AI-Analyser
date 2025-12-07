const analyzerService = require("../services/analyzerService");

exports.analyzeMR = async (req, res) => {
  await analyzerService.processMergeRequest(req.body);
  res.status(200).json({ status: "accepted" });
};
