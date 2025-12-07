const flows = new Map();

exports.findFlow = async (name) => flows.get(name);

exports.saveFlow = async (name, pageId) => {
  flows.set(name, { pageId });
};
