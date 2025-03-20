import { extractI18nBackendLoadPathConfig } from "../parsers/config-file-parser.js";
import { findI18nConfigFile } from "../utils.js";

async function testConfigExtraction() {
  try {
    // Find the i18n config file
    const configFile = await findI18nConfigFile();

    if (!configFile) {
      console.error("No i18n config file found");
      return;
    }

    console.log(`Found i18n config file: ${configFile}`);

    // Extract details from the config file
    const configDetails = await extractI18nBackendLoadPathConfig(configFile);

    if (!configDetails) {
      console.error("Failed to extract config details");
      return;
    }

    console.log("Extracted i18n config details:");
    console.log(`- loadPath: ${configDetails.loadPath}`);
    console.log(`- namespaces: ${configDetails.namespaces?.join(", ")}`);
    console.log(`- supportedLngs: ${configDetails.supportedLngs?.join(", ")}`);
  } catch (error) {
    console.error("Error testing config extraction:", error);
  }
}

// Run the test
testConfigExtraction();
