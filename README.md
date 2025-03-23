<img src="https://github.com/user-attachments/assets/4dd85ed4-900a-46ce-b189-551b916e5e2a" width="200"/>

# i18n-autocomplete

![CI Status](https://img.shields.io/github/actions/workflow/status/your-org/i18n-autocomplete/ci.yml?branch=main)  
![VS Code Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/ArielMints.i18next-autocomplete)  
![Downloads](https://img.shields.io/visual-studio-marketplace/d/ArielMints.i18next-autocomplete)

---

## 🌍 i18next Translation Key Autocomplete for VS Code

**i18n-autocomplete** supercharges your i18next development workflow by providing intelligent autocompletion for translation namespaces and keys.  
No more typos. No more guessing. Just accurate, context-aware IntelliSense directly in your editor.

---

## 📸 Preview

> 🧵 _Avoid this..._

<img width="272" alt="image" src="https://github.com/user-attachments/assets/19aa57ab-1eab-4713-97f1-ced676763a02" />
<img width="268" alt="image" src="https://github.com/user-attachments/assets/92bd4bc8-ca43-417a-9812-3046fdabe039" />

Broken keys in your app due to typos

> ✨ _With this..._

<img width="503" alt="image" src="https://github.com/user-attachments/assets/7d0ef9c9-2499-482e-8104-51a47572c6a1" />

<!-- Autocomplete screenshot -->

---

## ✨ Features

- 🔍 **Namespace Autocompletion**  
  Instantly complete namespace names based on your i18next configuration.

- 🧩 **Translation Key Autocompletion**  
  Get smart suggestions for keys inside your JSON translation files.

- 📁 **Supports `backend` plugin with `loadPath`**  
  Parses your i18next configuration to discover and load translation files using the `loadPath` option.

- 🛠️ **Minimal Setup**  
  Just one config required: the absolute path to your `public` folder, so the extension can resolve the translation files correctly.

> ⚠️ Currently, only `loadPath` is supported (not the `resources` inline config). Support coming soon!

---

## ⚙️ Configuration

To enable IntelliSense, the extension needs to know where your translation files live.  
You must set the absolute path to your project's `public` folder — this is where your `locales/` directory typically lives.

### 🔧 How to configure

#### Option 1: Through the VS Code **Settings UI**

1. Open the Command Palette → `Preferences: Open Settings (UI)`
2. Search for **i18next-autocomplete: Public Path**
3. Set the absolute path to your `public` folder

![image](https://github.com/user-attachments/assets/b0126391-1090-469a-9110-801c68ebb7ef)


#### Option 2: Add it directly in your `settings.json`

```json
"i18next-autocomplete.publicPath": "/Users/my-user/code/my-react-app/public/"
```

## 🤝 Contributing

Contributions are welcome and encouraged! 🙌

Whether it's fixing bugs, suggesting new features, or improving performance — feel free to open an issue or submit a PR.

**To get started:**

1. Clone the repo
2. Install dependencies: `npm install`
3. Run the extension in the Extension Development Host via VS Code
4. Make your magic! 🪄

---

Made with ❤️ for i18next users.
