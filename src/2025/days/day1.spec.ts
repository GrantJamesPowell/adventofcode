import { expect, test } from "bun:test";
import { readFileSync } from "fs";

type Dir = "L" | "R";

const parse = (data: string): [Dir, number][] =>
	data.split("\n").map((line) => {
		const [dir, ...num] = line;

		if (dir === undefined || num === undefined) {
			throw new Error(`Invalid input ${line}`);
		}

		return [dir === "L" ? "L" : "R", Number(num.join(""))];
	});

const testData = parse(
	`
L68
L30
R48
L5
R60
L55
L1
L99
R14
L82
`.trim(),
);

const data = parse(readFileSync("src/2025/inputs/day1.txt", "utf8").trim());

const mod = (n: number, m: number) => ((n % m) + m) % m;

function* runSeqP1(
	seq: Iterable<[Dir, number]>,
	opts: { start: number },
): Generator<number> {
	let current = opts.start;

	for (const [dir, amount] of seq) {
		const changeBy = amount * (dir === "L" ? -1 : 1);
		current = mod(current + changeBy, 100);
		yield current;
	}
}

const p1 = (data: Iterable<[Dir, number]>): number =>
	runSeqP1(data, { start: 50 })
		.filter((x) => x === 0)
		.reduce((n) => n + 1, 0 as number);

function* runSeqP2(
	data: Iterable<[Dir, number]>,
	opts: { start: number },
): Generator<[number, { passes: number }]> {
	let current = opts.start;

	for (const [dir, amount] of data) {
		let passes = 0;
		for (let i = 0; i < amount; i++) {
			current = mod(current + (dir === "L" ? -1 : 1), 100);
			if (current === 0) {
				passes++;
			}
		}

		yield [current, { passes }];
	}
}

const p2 = (data: Iterable<[Dir, number]>): number =>
	runSeqP2(data, { start: 50 })
		.map(([_num, { passes }]) => passes)
		.reduce((acc, next) => acc + next);

test(runSeqP1.name, () => {
	expect([...runSeqP1(testData, { start: 50 })]).toEqual([
		82, 52, 0, 95, 55, 0, 99, 0, 14, 32,
	]);

	for (const num of runSeqP1(data, { start: 50 })) {
		expect(num).toBeLessThan(100);
		expect(num).toBeGreaterThanOrEqual(0);
	}
});

test(p1.name, () => {
	expect(p1(testData)).toEqual(3);
	expect(p1(data)).toEqual(1152);
});

test(runSeqP2.name, () => {
	expect([...runSeqP2(testData, { start: 50 })]).toEqual([
		[82, { passes: 1 }],
		[52, { passes: 0 }],
		[0, { passes: 1 }],
		[95, { passes: 0 }],
		[55, { passes: 1 }],
		[0, { passes: 1 }],
		[99, { passes: 0 }],
		[0, { passes: 1 }],
		[14, { passes: 0 }],
		[32, { passes: 1 }],
	]);
});

test(p2.name, () => {
	expect(p2(testData)).toEqual(6);
	expect(p2(data)).toEqual(6671);
});
