exports.expandContext = async (payload) => {
  return payload.changes.map(c => ({
    file: c.new_path,
    diff: c.diff,
    content: "Fetched file content here",
  }));
};
