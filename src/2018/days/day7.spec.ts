import { readFileSync } from "fs";
import { test, expect } from "bun:test";
import { MinHeap } from "../../utils/heap";
const data = readFileSync("src/2018/inputs/day7.txt", "utf8").trim();

const testData = `
Step C must be finished before step A can begin.
Step C must be finished before step F can begin.
Step A must be finished before step B can begin.
Step A must be finished before step D can begin.
Step B must be finished before step E can begin.
Step D must be finished before step E can begin.
Step F must be finished before step E can begin.
`.trim();

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
	let done: string[] = [];

	let currTime = 0;

	const heap = new MinHeap<string>();

	while (graph.size > 0) {
		const next = graph
			.entries()
			.flatMap(([key, reqs]) => (reqs.isSubsetOf(new Set(done)) ? [key] : []))
			.toArray()
			.sort()
			.at(0);

		if (next === undefined || heap.size() >= workers) {
			const [nextTime, finishedTask] = heap.pop()!;
			done.push(finishedTask);
			currTime = nextTime;
			continue;
		}

		const finishedAt = currTime + cost + taskLetterToCost(next);
		heap.push(finishedAt, next);
		graph.delete(next);
	}

	while (heap.size() > 0) {
		const [finishedAt, _task] = heap.pop()!;
		currTime = Math.max(currTime, finishedAt);
	}

	return currTime;
};

test("p1", () => {
	expect(p1(parse(testData)).join("")).toEqual("CABDFE");
	expect(p1(parse(data)).join("")).toEqual("EUGJKYFQSCLTWXNIZMAPVORDBH");
});

test("p2", () => {
	expect(p2(parse(testData), { cost: 0, workers: 2 })).toEqual(15);
	expect(p2(parse(data), { cost: 60, workers: 5 })).toEqual(1014);
});
