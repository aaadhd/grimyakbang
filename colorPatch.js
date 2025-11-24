// colorPatch.js (ESM 버전)
// Node 18+ / "type": "module" 환경에서 바로 실행 가능
// 실행: node colorPatch.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = __dirname;

// 대상 확장자
const TARGET_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".css"];

// 재귀적으로 파일 수집
function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    // 스킵해야 하는 폴더
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === ".next" ||
      entry.name === "dist" ||
      entry.name === "build"
    ) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else {
      const ext = path.extname(entry.name);
      if (TARGET_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

// 실제 변환 로직
function transformContent(content) {
  let updated = content;

  // 1) 텍스트 대비 강화
  updated = updated.replace(/text-stone-700/g, "text-stone-700");
  updated = updated.replace(/text-stone-700/g, "text-stone-700");

  // 2) 카드 배경 대비 강화
  updated = updated.replace(/bg-stone-100/g, "bg-stone-100");

  // 3) CTA 강조 스타일 추가
  updated = updated.replace(
    /bg-\[#EB6A29\]/g,
    "bg-[#EB6A29] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8] border border-[#D85718] shadow-md shadow-[#FFD5B8]"
  );

  return updated;
}

async function main() {
  console.log("🎨 Proud100 색상 패치 시작 (ESM 버전)");

  const files = collectFiles(PROJECT_ROOT);
  console.log(`🔍 대상 파일 수: ${files.length}개`);

  let changedCount = 0;

  for (const file of files) {
    try {
      const original = fs.readFileSync(file, "utf8");
      const transformed = transformContent(original);

      if (original !== transformed) {
        fs.writeFileSync(file, transformed, "utf8");
        changedCount++;
        console.log(`✅ 수정됨: ${path.relative(PROJECT_ROOT, file)}`);
      }
    } catch (err) {
      console.warn(`⚠️ 실패: ${file} - ${err.message}`);
    }
  }

  console.log("✨ 패치 완료");
  console.log(`📌 총 수정된 파일: ${changedCount}개`);
}

main();
