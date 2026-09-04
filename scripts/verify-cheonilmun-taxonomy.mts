/**
 * 『천일문 기본』 분류표 무결성 검증.
 * 실행: node --experimental-strip-types scripts/verify-cheonilmun-taxonomy.mts
 * 또는: npx --yes tsx scripts/verify-cheonilmun-taxonomy.mts
 */
import {
  CHEONILMUN_BASIC_CHAPTERS,
  CHEONILMUN_BASIC_PARTS,
  CHEONILMUN_BASIC_UNITS,
  verifyCheonilmunBasicTaxonomy,
} from "../src/lib/lesson-materials/cheonilmun-basic-taxonomy.ts";

const errors = verifyCheonilmunBasicTaxonomy();
if (errors.length) {
  console.error("Cheonilmun taxonomy errors:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}

console.log(
  `OK: PART ${CHEONILMUN_BASIC_PARTS.length}, CHAPTER ${CHEONILMUN_BASIC_CHAPTERS.length}, UNIT ${CHEONILMUN_BASIC_UNITS.length}`
);
