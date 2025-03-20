import * as fs from "fs";

const loadAndParseTranslationJSONFile = async (path: string) => {
  try {
    const content = await fs.promises.readFile(path, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error parsing JSON in ${path}:`, error);
    return null;
  }
};

export { loadAndParseTranslationJSONFile };
