const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "../../content/newsletters");

module.exports = () => {
  return fs
    .readdirSync(DIR)
    .filter((f) => /^\d{4}-\d{2}-newsletter\.(pdf|html)$/.test(f))
    .sort()
    .reverse()
    .map((file) => {
      const [year, month] = file.split("-");
      return { file, year, month, url: `/newsletters/${file}` };
    });
};
