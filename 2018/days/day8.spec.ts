import { test, expect } from "bun:test";
import { readFileSync } from "fs";
import { range } from "lodash";

const data = readFileSync("./2018/inputs/day8.txt", "utf8").trim();
const testData = `2 3 0 3 10 11 12 1 1 0 1 99 2 1 1 2`;

function* yieldElements<T>(xs: T[]): Generator<T> {
	for (const x of xs) {
		yield x;
	}
}

const readNode = (nums: Iterator<number>): AST => {
	const numChildren = nums.next()!;
	const numMeta = nums.next()!;

	if (numChildren.done || numMeta.done) {
		throw new Error("Finished Earlyy??");
	}

	const children: AST[] = [];
	const metadata: number[] = [];

	for (const _ of range(0, numChildren.value)) {
		children.push(readNode(nums));
	}

	for (const _ of range(0, numMeta.value)) {
		let n = nums.next();
		if (n.done) {
			throw new Error("Iterator finished early");
		}
		metadata.push(n.value);
	}

	return { metadata, children };
};

function* readMetaP1(ast: AST): Generator<number> {
	for (const meta of ast.metadata) {
		yield meta;
	}

	for (const child of ast.children) {
		yield* readMetaP1(child);
	}
}

const readMetaP2 = ({ metadata, children }: AST): number => {
	if (children.length === 0) {
		return metadata.reduce((acc, next) => acc + next);
	} else {
		return metadata
			.map((idx) => {
				const child = children[idx - 1];
				return child !== undefined ? readMetaP2(child) : 0;
			})
			.reduce((x, y) => x + y);
	}
};

type AST = { metadata: number[]; children: AST[] };

const p1 = (data: string): number => {
	const nums = data.split(" ").map(Number);
	const ast = readNode(yieldElements(nums));
	return readMetaP1(ast).reduce((x, y) => x + y);
};

const p2 = (data: string): number => {
	const nums = data.split(" ").map(Number);
	const ast = readNode(yieldElements(nums));
	return readMetaP2(ast);
};

test("p1", () => {
	expect(p1(testData)).toEqual(138);
	expect(p1(data)).toEqual(38780);
});

test("p2", () => {
	expect(p2(testData)).toEqual(66);
	expect(p2(data)).toEqual(18232);
});
