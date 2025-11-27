import { expect, test } from "bun:test";
import { exec } from "child_process";
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

type Token = "do" | "don't" | [number, number];

function* lex(input: string): IterableIterator<Token> {
	let i = 0;

	while (i < input.length) {
		let rest = input.slice(i);

		if (rest.startsWith("do()")) {
			i += "do()".length;
			yield "do";
		} else if (rest.startsWith("don't()")) {
			i += "don't()".length;
			yield "don't";
		} else if (rest.startsWith("mul(")) {
			const match = rest.match(/mul\((\d+),(\d+)\)/);

			if (match === null) {
				i++;
				continue;
			} else {
				i += match[0].length;
				let num1 = match[1]!;
				let num2 = match[2]!;
				yield [Number(num1), Number(num2)];
			}
		} else {
			i++;
		}
	}
}

test("pt2", () => {
	let testCase = `xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))`;
	// do and dont lexing
	expect([...lex("")]).toEqual([]);
	expect([...lex("do")]).toEqual([]);
	expect([...lex("do()")]).toEqual(["do"]);
	expect([...lex("do()do()")]).toEqual(["do", "do"]);
	expect([...lex("aaado()aaado()aaa")]).toEqual(["do", "do"]);
	expect([...lex("aaadont()aaado()aaa")]).toEqual(["do"]);
	expect([...lex("aaadon't()aaado()aaa")]).toEqual(["don't", "do"]);

	// mul lexing
	expect([...lex("mul(1,2)")]).toEqual([[1, 2]]);
	expect([...lex("multiply(1,2)")]).toEqual([]);
	expect([...lex("mul(1,2)do()mul(3,44343)do()mul(5, 6)don't()")]).toEqual([
		[1, 2],
		"do",
		[3, 44343],
		"do",
		"don't",
	]);

	expect([...lex(testCase)]).toEqual([
		[2, 4],
		"don't",
		[5, 5],
		[11, 8],
		[11, 8],
		"do",
		[8, 5],
	]);

	let answer = (input: string) => {
		let res = 0;
		let enabled = true;

		for (const token of lex(input)) {
			if (token === "do") {
				enabled = true;
			} else if (token === "don't") {
				enabled = false;
			} else {
				if (enabled) {
					res += token[0] * token[1];
				}
			}
		}

		return res;
	};

	expect(answer(testCase)).toEqual(48);
	expect(answer(data)).toEqual(93790718);
});
