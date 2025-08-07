/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {translate } from "@vitalets/google-translate-api"; // ✅ LIB BOA

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseLangPath = join(__dirname, "en-US.json");
const targetLangPath = join(__dirname, "pt-BR.json");

async function autoTranslateMissingKeys() {
  const base = JSON.parse(fs.readFileSync(baseLangPath, "utf-8"));
  let target = {};
  if (fs.existsSync(targetLangPath)) {
    const fileContent = fs.readFileSync(targetLangPath, "utf-8");
    try {
      target = JSON.parse(fileContent || "{}");
    } catch (err) {
      console.error("❌ pt-BR.json está malformado.");
      process.exit(1);
    }
  }

  async function deepTranslate(
    source: any,
    target: any,
    prefix = ""
  ): Promise<any> {
    const result: any = { ...target };

    for (const key of Object.keys(source)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof source[key] === "object") {
        result[key] = await deepTranslate(
          source[key],
          target[key] || {},
          fullKey
        );
      } else if (!target?.[key]) {
        const textToTranslate = source[key];
        console.log(`🔁 Translating [${fullKey}]: "${textToTranslate}"`);

        try {
          const translation = await translate(textToTranslate, { to: "pt-BR" });
          result[key] = translation.text;
        } catch (err) {
          console.warn(`❌ Failed to translate [${fullKey}]`, err);
          result[key] = textToTranslate;
        }
      } else {
        result[key] = target[key];
      }
    }

    return result;
  }

  const filled = await deepTranslate(base, target);
  fs.writeFileSync(targetLangPath, JSON.stringify(filled, null, 2), "utf-8");
  console.log(`✅ pt-BR.json atualizado com traduções faltantes.`);
}

autoTranslateMissingKeys();
