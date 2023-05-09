const axios = require("axios");
const fs = require("fs-extra");
const nodePath = require("path");

const ENCODING = "utf-8";
const README_PATH = nodePath.join(__dirname, "README.md");
const NEW_ISSUES_PATH = nodePath.join(__dirname, "new_issues.json");
const ALL_ISSUES_PATH = nodePath.join(__dirname, "all_issues.json");
const README_DEFAULT_CONTENT = "# leadership-quotes-collection\n来自东方神秘国度各大公司大聪明语录合集\n\n"

const ISSUES_API =
  "https://api.github.com/repos/wwzgxsyf/leadership-quotes-collection/issues?state=all&sort=created&direction=asc";

const fileExistJudge = () => {
  if (!fs.pathExistsSync(README_PATH)) {
    fs.createFileSync(README_PATH);
  }

  if (!fs.pathExistsSync(ALL_ISSUES_PATH)) {
    fs.createFileSync(ALL_ISSUES_PATH);
    fs.writeJSONSync(ALL_ISSUES_PATH, []);
  }

  if (!fs.pathExistsSync(NEW_ISSUES_PATH)) {
    fs.createFileSync(NEW_ISSUES_PATH);
    fs.writeJSONSync(NEW_ISSUES_PATH, []);
  }
};

function convertJsonToMarkdownAndWriteToFile(data) {
  let content = README_DEFAULT_CONTENT

   content = data?.reduce((pre, cur, curIndex) => {
    if (curIndex === 0) {
      pre += `| id | content |\n|----|---------|\n`;
    }

    return pre + `|  ${cur.number} | ${cur.content} |\n`;
  }, content);

  return content
}

(async () => {
  let { data } = await axios(ISSUES_API);

  data = data.map((item) => ({ number: item.number, content: item.body }));

  fileExistJudge();

  const allData = fs.readJSONSync(ALL_ISSUES_PATH, { encoding: ENCODING });

  const extraData = data.filter(
    (v) => !allData.find((item) => item.number === v.number)
  );

  fs.writeFileSync(
    README_PATH,
    convertJsonToMarkdownAndWriteToFile(allData),
    {
      encoding: ENCODING,
    }
  );

  fs.writeJSONSync(NEW_ISSUES_PATH, extraData, {
    encoding: ENCODING,
  });

  fs.writeJSONSync(ALL_ISSUES_PATH, [...allData, ...extraData], {
    encoding: ENCODING,
  });
})();
