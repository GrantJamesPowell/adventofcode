import { readFileSync } from "fs";
import { test, expect } from "bun:test";
const data = readFileSync("./2018/inputs/day7.txt", "utf8").trim();

const testData = `
Step C must be finished before step A can begin.
Step C must be finished before step F can begin.
Step A must be finished before step B can begin.
Step A must be finished before step D can begin.
Step B must be finished before step E can begin.
Step D must be finished before step E can begin.
Step F must be finished before step E can begin.
`.trim();

class MinHeap<T> {
	readonly data: T[];
	constructor() {
		this.data = [];
	}

	size() {
		return this.data.length;
	}

	peek() {
		return this.data[0];
	}

	push(value: T) {
		this.data.push(value);
		this.#bubbleUp();
	}

	pop() {
		if (this.data.length === 0) return undefined;
		if (this.data.length === 1) return this.data.pop();

		const min = this.data[0];
		this.data[0] = this.data.pop()!;
		this.#bubbleDown();
		return min;
	}

	#bubbleUp() {
		let i = this.data.length - 1;
		while (i > 0) {
			const parent = Math.floor((i - 1) / 2);
			if (this.data[parent]! <= this.data[i]!) break;
			[this.data[i], this.data[parent]] = [this.data[parent]!, this.data[i]!];
			i = parent;
		}
	}

	#bubbleDown() {
		let i = 0;
		const length = this.data.length;

		while (true) {
			const left = 2 * i + 1;
			const right = 2 * i + 2;
			let smallest = i;

			if (left < length && this.data[left]! < this.data[smallest]!) {
				smallest = left;
			}
			if (right < length && this.data[right]! < this.data[smallest]!) {
				smallest = right;
			}
			if (smallest === i) break;

			[this.data[i], this.data[smallest]] = [
				this.data[smallest]!,
				this.data[i]!,
			];
			i = smallest;
		}
	}
}

// Maps A => Requires All of Set
type DepGraph = Map<string, Set<string>>;

const parse = (str: string): DepGraph => {
	const result: DepGraph = new Map();

	for (const line of str.split("\n")) {
		const words = line.split(" ");

		const from = words[1]!;
		const to = words[7]!;

		result.set(from, result.get(from) ?? new Set());
		result.set(to, result.get(to) ?? new Set());

		result.get(to)!.add(from);
	}

	return result;
};

const p1 = (graph: DepGraph): string[] => {
	const result: string[] = [];

	while (graph.size > 0) {
		const next = graph
			.entries()
			.flatMap(([key, reqs]) => (reqs.isSubsetOf(new Set(result)) ? [key] : []))
			.toArray()
			.sort()
			.at(0);

		if (next == undefined) {
			throw new Error(`Circ Dep issue on ${graph.keys().toArray().join(", ")}`);
		}

		result.push(next);
		graph.delete(next);
	}

	return result;
};

const taskLetterToCost = (c: string) => c.charCodeAt(0) - "A".charCodeAt(0) + 1;

const p2 = (
	graph: DepGraph,
	opts: { cost: number; workers: number },
): number => {
	const { cost, workers } = opts;
	let currTime = 0;

	const heap = new MinHeap<number>();

	for (const task of p1(graph)) {
		const taskCost = cost + taskLetterToCost(task);

		if (heap.size() >= workers) {
			currTime = heap.pop()!;
		}

		heap.push(currTime + taskCost);
	}

	while (heap.size() > 0) {
		currTime = Math.max(currTime, heap.pop()!);
	}

	return currTime;
};

test("p1", () => {
	expect(p1(parse(testData)).join("")).toEqual("CABDFE");
	expect(p1(parse(data)).join("")).toEqual("EUGJKYFQSCLTWXNIZMAPVORDBH");
});

test("p2", () => {
	expect(p2(parse(testData), { cost: 0, workers: 2 })).toEqual(15);
});
