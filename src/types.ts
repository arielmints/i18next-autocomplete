export type TranslationResource = {
  locale: string;
  filePath: string;
  namespace?: string;
};

export type ConfigDetails = {
  loadPath: string | null;
  absoluteLoadPath: string | null;
  namespaces: string[] | null;
  supportedLngs: string[] | null;
};

export type ConfigType = "resources" | "loadPath";
