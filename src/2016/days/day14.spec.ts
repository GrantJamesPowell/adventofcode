import { expect, test } from "bun:test";
import { createHash } from "crypto";

const md5 = (input: string) => createHash("md5").update(input).digest("hex");
const hashAt = (salt: string, idx: number) => md5(`${salt}${idx}`);

const analyzeHash = (hash: string) => {
	const matches3 = /(.)\1\1/.exec(hash);
	const matches5 = /(.)\1{4}/.exec(hash);

	return { m3: matches3?.[1] ?? null, m5: matches5?.[1] ?? null };
};

function* hashStream(salt: string): Generator<string> {
	let index = 0;

	while (true) {
		yield md5(`${salt}${index}`);
		index++;
	}
}

function* runP1(
	salt: string,
): Generator<{ hash: string; char: string; m3at: number; m5at: number }> {
	const hashes = hashStream(salt).map((hash, idx) => [idx, hash] as const);

	let trips: Map<string, number[]> = new Map();

	for (const [idx, hash] of hashes) {
		const { m3, m5 } = analyzeHash(hash);

		if (m3) {
			if (!trips.has(m3)) {
				trips.set(m3, []);
			}
			trips.get(m3)!.push(idx);
		}

		if (m5) {
			const tripsForChar = trips.get(m5) ?? [];
			trips.set(m5, []);

			for (const m3at of tripsForChar) {
				if (idx - m3at < 1000) {
					yield { hash, char: m5, m3at, m5at: idx };
				}
			}
		}
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
	expect(
		runP1(testData)
			.map((x) => x.m3at)
			.take(68)
			.toArray()
			.sort((a, b) => a - b),
	).toEqual([]);
});
