import { expect, test } from "bun:test";
import { createHash } from "crypto";

const md5 = (input: string) => createHash("md5").update(input).digest("hex");

function* hashStream(salt: string): Generator<string> {
	let index = 0;

	while (true) {
		yield md5(`${salt}${index}`);
    index++;
	}
}

const p1 = (salt: string): number => {
  const hashes = hashStream(salt).map((hash, idx) => [idx, hash] as const);

  let found = 0;
  let trips: Map<string, number[]> = new Map();

  for (const [idx, hash] of hashes) {
    const matches3 = /(.)\1\1/.exec(hash);

    if (matches3 !== null) {
      const char = matches3[1]!;
      if (!trips.has(char)) {
        trips.set(char, []);
      }
      trips.get(char)!.push(idx);
    }

    const matches5 = /(.)\1{4}/.exec(hash);

    if (matches5 !== null) {
      const char = matches5[1]!;
      const previous = trips.get(char) ?? [];
    }

    if (found === 64) {
      return idx;
    }
  }
}

const testData = "abc";
const data = "qzyelonm";

test(p1.name, () => {
  expect(p1(testData)).toEqual(22728);
})
