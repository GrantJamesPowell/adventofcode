import { readFileSync } from "fs";
import { test, expect } from "bun:test";
const data = readFileSync("./2023/inputs/day8.txt", "utf8").trim();

const testData1 = `
RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)`.trim();

const testData2 = `
LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)
`.trim();

function* cycle<T>(arr: T[]): Generator<T> {
	while (true) {
		for (const x of arr) {
			yield x;
		}
	}
}

const parse = (
	data: string,
): {
	instructions: ("L" | "R")[];
	path: Map<string, { L: string; R: string }>;
} => {
	let path: Map<string, { L: string; R: string }> = new Map();

	const [instructionLine, empty, ...pathLines] = data.split("\n");

	if (instructionLine === undefined || empty !== "") {
		throw new Error(`Invalid data ${instructionLine}`);
	}
	const instructions: ("L" | "R")[] = [...instructionLine].map(
		(instruction) => {
			if (instruction === "L" || instruction === "R") {
				return instruction;
			} else {
				throw new Error(`Invalid instruction "${instruction}"`);
			}
		},
	);

	for (const pathLine of pathLines) {
		const match = pathLine.match(/(\w+)\s*=\s*\((\w+),\s*(\w+)\)/);

		if (match) {
			const [from, L, R] = match.slice(1);
			path.set(from!, { L: L!, R: R! });
		} else {
			throw new Error(`Invalid path ${pathLine}`);
		}
	}

	return { instructions, path };
};

const pt1 = (str: string): number => {
	let steps = 0;
	const { instructions, path } = parse(str);

	let curr = "AAA";
	for (const instruction of cycle(instructions)) {
		if (curr === "ZZZ") {
			break;
		}
		steps++;
		curr = path.get(curr)![instruction];
	}

	return steps;
};

const gcd = (a: number, b: number): number => {
	while (b !== 0) [a, b] = [b, a % b];
	return a;
};

const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

const pt2 = (str: string) => {
	const { instructions, path } = parse(str);

	const firstHit = (node: string): number => {
		let step = 0;

		let curr = node;
		for (const instruction of cycle(instructions)) {
			if (curr.endsWith("Z")) {
				break;
			}

			step++;
			curr = path.get(curr)![instruction];
		}

		return step;
	};

	return path
		.keys()
		.filter((node) => node.endsWith("A"))
		.map(firstHit)
		.reduce(lcm);
};

test("pt1", () => {
	expect(pt1(testData1)).toEqual(2);
	expect(pt1(testData2)).toEqual(6);
	expect(pt1(data)).toEqual(18727);
});

test("pt2", () => {
	expect(pt2(data)).toEqual(18024643846273);
});
