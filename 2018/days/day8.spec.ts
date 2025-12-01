import { test, expect } from "bun:test";
import { range } from "lodash";

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
      throw new Error("Iterator finished early")
    }
    metadata.push(n.value);
	}

	return { metadata, children };
};

function* readMeta(ast: AST): Generator<number> {
	for (const meta of ast.metadata) {
		yield meta;
	}

	for (const child of ast.children) {
		yield* readMeta(child);
	}
}

type AST = { metadata: number[]; children: AST[] };

const p1 = (data: string): number => {
	const nums = data.split(" ").map(Number);
	const ast = readNode(yieldElements(nums));
	return readMeta(ast).reduce((x, y) => x + y);
};

test("p1", () => {
	expect(p1(testData)).toEqual(138);
});
