import { test, expect } from "bun:test";
import { readFileSync } from "fs";
import { range } from "lodash";

type AST = { metadata: number[]; children: AST[] };

const readNode = (nums: Iterator<number>): AST => {
	const numChildren = nums.next()!;
	const numMeta = nums.next()!;

	if (numChildren.done || numMeta.done) {
		throw new Error("Invalid input, interator finished early");
	}

	const children: AST[] = range(0, numChildren.value).map(() => readNode(nums));
	const metadata: number[] = range(0, numMeta.value).map(() => {
		let n = nums.next();
		return n.done ? 0 : n.value;
	});

	return { metadata, children };
};

const p1 = ({ metadata, children }: AST): number =>
	metadata.reduce((acc, next) => acc + next) +
	children.reduce((acc, child) => acc + p1(child), 0);

const p2 = ({ metadata, children }: AST): number =>
	children.length === 0
		? metadata.reduce((acc, next) => acc + next, 0)
		: metadata.reduce((acc, idx) => {
				const child = children[idx - 1];
				return child !== undefined ? acc + p2(child) : acc;
			}, 0);

const parse = (data: string): AST =>
	readNode(data.split(" ").map(Number).values());

const data = parse(readFileSync("src/2018/inputs/day8.txt", "utf8").trim());
const testData = parse(`2 3 0 3 10 11 12 1 1 0 1 99 2 1 1 2`);

test("p1", () => {
	expect(p1(testData)).toEqual(138);
	expect(p1(data)).toEqual(38780);
});

test("p2", () => {
	expect(p2(testData)).toEqual(66);
	expect(p2(data)).toEqual(18232);
});
