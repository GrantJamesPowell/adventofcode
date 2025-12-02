import { expect, test } from "bun:test";
import { createHash } from "crypto";

const md5 = (input: string) => createHash("md5").update(input).digest("hex");

const hashCache = new Map<string, string>();

const hashAt = (salt: string, idx: number) => {
  const key = (`${salt}${idx}`);
  const existing = hashCache.get(key);

  if (existing) {
    return existing;
  }
  const result = md5(key);
  hashCache.set(key, result);
  return result;
};

const analyzeHash = (hash: string) => {
	const matches3 = /(.)\1\1/.exec(hash);
	const matches5 = /(.)\1{4}/.exec(hash);

	return { m3: matches3?.[1] ?? null, m5: matches5?.[1] ?? null };
};

function* runP1(salt: string): Generator<number> {
  let idx = 0;

  while (true) {
    let hash = hashAt(salt, idx);
    const { m3 } = analyzeHash(hash);

    if (m3 !== null) {

      for (let i = 1; i <= 1000; i++) {
        const { m5 } = analyzeHash(hashAt(salt, idx + i));
        if (m3 === m5) {
          yield idx;
          break;
        }
      }
    }

    idx++;
  }
}

const testData = "abc";
const data = "qzyelonm";

test(hashAt.name, () => {
	expect(hashAt(testData, 18)).toEqual(`0034e0923cc38887a57bd7b1d4f953df`);
	expect(hashAt(testData, 39)).toEqual(`347dac6ee8eeea4652c7476d0f97bee5`);
});

test(analyzeHash.name, () => {
	expect(analyzeHash(hashAt(testData, 18))).toEqual({ m3: "8", m5: null });
	expect(analyzeHash(hashAt(testData, 39))).toEqual({ m3: "e", m5: null });
	expect(analyzeHash(hashAt(testData, 816))).toEqual({ m3: "e", m5: "e" });
});

test(runP1.name, () => {
	expect(runP1(testData).drop(63).take(1).toArray()).toEqual([22728]);
  expect(runP1(data).drop(63).take(1).toArray()).toEqual([15168]);
});
