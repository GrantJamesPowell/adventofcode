import { expect, test } from "bun:test";
import { readFileSync } from "fs";
import _, { find } from "lodash";
import { runInThisContext } from "vm";

const data = readFileSync("./inputs/day3.txt", "utf8");

const findMuls = (x: string): string[] => {
	const regex = /mul\(\d+,\s*\d+\)/g;
	return [...x.matchAll(regex)].map((m) => m[0]);
};

const parseMul = (str: string): [number, number] => {
	const match = str.match(/mul\((\d+),\s*(\d+)\)/);
	if (!match) {
		throw new Error(`Invalid str: ${str}`);
	}
	return [Number(match[1]), Number(match[2])];
};

const runPt1 = (input: string) =>
	findMuls(input)
		.map((mul) => parseMul(mul))
		.map(([x, y]) => x * y)
		.reduce((x, y) => x + y);

test("pt1", () => {
	let testCase = `xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))`;

	expect(findMuls(testCase)).toEqual([
		"mul(2,4)",
		"mul(5,5)",
		"mul(11,8)",
		"mul(8,5)",
	]);

	expect(findMuls(testCase).map((match) => parseMul(match))).toEqual([
		[2, 4],
		[5, 5],
		[11, 8],
		[8, 5],
	]);

  expect(runPt1(testCase)).toEqual(161);

	const answer = runPt1(data);
  expect(answer).toEqual(185797128);
});
