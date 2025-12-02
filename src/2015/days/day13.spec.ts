import { readFileSync } from "fs";
import { test, expect } from "bun:test";
const data = readFileSync("src/2015/inputs/day13.txt", "utf8").trim();

const testData = `
Alice would gain 54 happiness units by sitting next to Bob.
Alice would lose 79 happiness units by sitting next to Carol.
Alice would lose 2 happiness units by sitting next to David.
Bob would gain 83 happiness units by sitting next to Alice.
Bob would lose 7 happiness units by sitting next to Carol.
Bob would lose 63 happiness units by sitting next to David.
Carol would lose 62 happiness units by sitting next to Alice.
Carol would gain 60 happiness units by sitting next to Bob.
Carol would gain 55 happiness units by sitting next to David.
David would gain 46 happiness units by sitting next to Alice.
David would lose 7 happiness units by sitting next to Bob.
David would gain 41 happiness units by sitting next to Carol.
`.trim();

type Graph = Map<string, Map<string, number>>;

const parse = (str: string): Graph => {
	const graph: Graph = new Map();

	for (const line of str.split("\n")) {
		const words = line.replaceAll(".", "").split(" ");

		const from = words[0];
		const direction = words[2];
		const amount = words[3];
		const whom = words.at(-1);

		if (!graph.has(from!)) {
			graph.set(from!, new Map());
		}

		graph
			.get(from!)!
			.set(whom!, Number(amount) * (direction === "gain" ? 1 : -1));
	}

	return graph;
};

function* permuations<T>(input: T[]): Generator<T[]> {
	const [first, ...rest] = input;

	if (first === undefined) {
		yield [];
		return;
	}

	if (rest.length === 0) {
		yield [first];
		return;
	}

	for (const child of permuations(rest)) {
		for (let i = 0; i < child.length + 1; i++) {
			yield [...child.slice(0, i), first, ...child.slice(i)];
		}
	}
}

function* wrapping2Windows<T>(arr: T[]): Generator<[T, T]> {
	if (arr.length <= 1) {
		return;
	}

	if (arr.length === 2) {
		yield [arr[0]!, arr[1]!];
		return;
	}

	for (let i = 0; i < arr.length - 1; i++) {
		yield [arr[i]!, arr[i + 1]!];
	}
	yield [arr.at(-1)!, arr[0]!];
}

const pt1 = (graph: Graph) =>
	permuations([...graph.keys()])
		.map((perm) =>
			wrapping2Windows(perm).flatMap(([l, r]) => [
				graph.get(l)!.get(r)!,
				graph.get(r)!.get(l)!,
			]),
		)
		.map((result) => result.reduce((x, y) => x + y))
		.reduce(Math.max);

test("permuations", () => {
	expect([...permuations([1, 2])].sort()).toEqual([
		[1, 2],
		[2, 1],
	]);
	expect([...permuations([1, 2, 3])].sort()).toEqual([
		[1, 2, 3],
		[1, 3, 2],
		[2, 1, 3],
		[2, 3, 1],
		[3, 1, 2],
		[3, 2, 1],
	]);
});

test(wrapping2Windows.name, () => {
	expect([...wrapping2Windows([])]).toEqual([]);
	expect([...wrapping2Windows([1])]).toEqual([]);
	expect([...wrapping2Windows([1, 2])]).toEqual([[1, 2]]);
	expect([...wrapping2Windows([1, 2, 3])]).toEqual([
		[1, 2],
		[2, 3],
		[3, 1],
	]);
	expect([...wrapping2Windows([1, 2, 3, 4])]).toEqual([
		[1, 2],
		[2, 3],
		[3, 4],
		[4, 1],
	]);
});

test("pt1", () => {
	expect(pt1(parse(testData))).toEqual(330);
	expect(pt1(parse(data))).toEqual(40319);
});
