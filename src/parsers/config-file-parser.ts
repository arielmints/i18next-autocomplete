import * as fs from "fs";
import path from "path";
import { getPublicPathFromSettings } from "../backend-loadpath-utils";
import { ConfigDetails, TranslationResource } from "../types";

/**
 * Removes URL parameters from a given URL string
 * @param url The URL string to process
 * @returns The URL string with parameters removed
 */
const removeUrlParams = (url: string): string => {
  try {
    const parsedUrl = new URL(url, "http://dummy.com"); // Use a dummy base for relative URLs
    return decodeURIComponent(parsedUrl.pathname);
  } catch {
    return decodeURIComponent(url.split("?")[0]); // Fallback for invalid URLs
  }
};

/**
 * Extracts i18n configuration backend loadPath details from a config file
 * @param configFilePath Path to the i18n config file
 * @returns Object containing loadPath, absoluteLoadPath, namespaces, and supportedLngs, or null if extraction fails
 */
async function extractI18nBackendLoadPathConfig(
  configFilePath: string
): Promise<ConfigDetails | null> {
  try {
    // Read the file content
    const content = await fs.promises.readFile(configFilePath, "utf8");

    // Extract loadPath from backend configuration
    // This regex handles different formatting styles and whitespace
    const loadPathRegex =
      /backend\s*:\s*{[^}]*loadPath\s*:\s*["'`]([^"'`]+)["'`][^}]*}/s;
    const loadPathMatch = content.match(loadPathRegex);
    const loadPath = loadPathMatch ? removeUrlParams(loadPathMatch[1]) : null;

    const publicPath = getPublicPathFromSettings();
    // Calculate absolute path if loadPath exists
    const pathDirname = path.dirname(configFilePath);
    const absoluteLoadPath = loadPath
      ? path.join(publicPath.toString(), loadPath)
      : null;

    // Extract namespaces from ns configuration
    // This regex handles array notation with different formatting styles
    const nsRegex = /ns\s*:\s*\[\s*([^\]]+)\s*\]/s;
    const nsMatch = content.match(nsRegex);

    let namespaces: string[] | null = null;
    if (nsMatch) {
      // Extract the array content and split by commas
      const nsContent = nsMatch[1];
      // Match all quoted strings (handles single, double, and backtick quotes)
      const nsItemsRegex = /["'`]([^"'`]+)["'`]/g;
      const nsItems: string[] = [];

      let itemMatch;
      while ((itemMatch = nsItemsRegex.exec(nsContent)) !== null) {
        nsItems.push(itemMatch[1]);
      }

      if (nsItems.length > 0) {
        namespaces = nsItems;
      }
    }

    // Extract supportedLngs from configuration
    // This regex handles array notation with different formatting styles
    const supportedLngsRegex = /supportedLngs\s*:\s*\[\s*([^\]]+)\s*\]/s;
    const supportedLngsMatch = content.match(supportedLngsRegex);

    let supportedLngs: string[] | null = null;
    if (supportedLngsMatch) {
      // Extract the array content
      const supportedLngsContent = supportedLngsMatch[1];
      // Match all quoted strings (handles single, double, and backtick quotes)
      const supportedLngsItemsRegex = /["'`]([^"'`]+)["'`]/g;
      const supportedLngsItems: string[] = [];

      let itemMatch;
      while (
        (itemMatch = supportedLngsItemsRegex.exec(supportedLngsContent)) !==
        null
      ) {
        supportedLngsItems.push(itemMatch[1]);
      }

      if (supportedLngsItems.length > 0) {
        supportedLngs = supportedLngsItems;
      }
    }

    // If no supportedLngs array found, try to extract single language from lng property
    if (!supportedLngs) {
      const lngRegex = /lng\s*:\s*["'`]([^"'`]+)["'`]/s;
      const lngMatch = content.match(lngRegex);

      if (lngMatch && lngMatch[1]) {
        supportedLngs = [lngMatch[1]];
      }
    }

    return { loadPath, absoluteLoadPath, namespaces, supportedLngs };
  } catch (error) {
    console.error("Error extracting i18n config details:", error);
    return null;
  }
}

/**
 * Parses an i18next configuration file to extract translation resources
 * @param configFilePath Path to the i18next config file
 * @returns Array of TranslationResource objects containing locale and filePath
 */
async function extractI18nConfigFileResources(
  configFilePath: string
): Promise<TranslationResource[]> {
  try {
    // Read the file content
    const content = await fs.promises.readFile(configFilePath, "utf8");

    // Extract resources information
    const resources: TranslationResource[] = [];

    // Look for import statements for translation files
    const importRegex = /import\s+(\w+)\s+from\s+["'](.+?)["']/g;
    const imports: Record<string, string> = {};
    const configDir = path.dirname(configFilePath);

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const variableName = match[1];
      const importPath = match[2];
      // Convert relative path to absolute
      const absolutePath = path.resolve(configDir, importPath);
      imports[variableName] = absolutePath;
    }

    // Look for resources object definition
    const resourcesMatch = content.match(
      /const\s+resources\s*=\s*({[\s\S]*?});/
    );
    if (resourcesMatch) {
      const resourcesObj = resourcesMatch[1];

      // Extract locales
      const localeRegex = /(\w+)\s*:\s*{/g;
      while ((match = localeRegex.exec(resourcesObj)) !== null) {
        const locale = match[1];

        // Look for translation assignments within this locale
        const translationVarRegex = new RegExp(
          `${locale}\\s*:\\s*{[\\s\\S]*?translation\\s*:\\s*(\\w+)`,
          "g"
        );
        const translationMatch = translationVarRegex.exec(resourcesObj);

        if (translationMatch) {
          const translationVar = translationMatch[1];
          if (imports[translationVar]) {
            resources.push({
              locale,
              filePath: imports[translationVar], // Already absolute path
            });
          }
        }
      }
    }

    // Alternative pattern: resources directly in i18n.init
    const initResourcesMatch = content.match(
      /i18n[\s\S]*?\.init\s*\(\s*{[\s\S]*?resources\s*:\s*({[\s\S]*?}),/
    );
    if (initResourcesMatch && resources.length === 0) {
      const resourcesObj = initResourcesMatch[1];

      // Extract locales
      const localeRegex = /(\w+)\s*:\s*{/g;
      while ((match = localeRegex.exec(resourcesObj)) !== null) {
        const locale = match[1];

        // Look for translation assignments within this locale
        const translationVarRegex = new RegExp(
          `${locale}\\s*:\\s*{[\\s\\S]*?translation\\s*:\\s*(\\w+)`,
          "g"
        );
        const translationMatch = translationVarRegex.exec(resourcesObj);

        if (translationMatch) {
          const translationVar = translationMatch[1];
          if (imports[translationVar]) {
            resources.push({
              locale,
              filePath: imports[translationVar], // Already absolute path
            });
          }
        }
      }
    }

    // Handle inline resources definition
    const supportedLngsMatch = content.match(/supportedLngs\s*:\s*\[(.*?)\]/);
    if (supportedLngsMatch && resources.length === 0) {
      const supportedLngs = supportedLngsMatch[1]
        .split(",")
        .map((lang) => lang.trim().replace(/['"]/g, ""))
        .filter(Boolean);

      // Try to infer file paths based on common patterns
      const configDir = path.dirname(configFilePath);

      for (const locale of supportedLngs) {
        // Common patterns for translation file locations with absolute paths
        const possiblePaths = [
          path.resolve(configDir, "..", "locales", locale, "common.js"),
          path.resolve(configDir, "..", "locales", locale, "translation.json"),
          path.resolve(configDir, "..", "translations", locale + ".json"),
        ];

        for (const possiblePath of possiblePaths) {
          try {
            await fs.promises.access(possiblePath);
            // File exists
            resources.push({
              locale,
              filePath: possiblePath,
            });
            break;
          } catch {
            // File doesn't exist, try next pattern
          }
        }
      }
    }

    return resources;
  } catch (error) {
    console.error("Error parsing i18n config file:", error);
    return [];
  }
}

export { extractI18nBackendLoadPathConfig, extractI18nConfigFileResources };
