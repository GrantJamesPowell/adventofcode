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

export class MinHeap<T> {
	private data: Array<{ priority: number; value: T }> = [];

	size(): number {
		return this.data.length;
	}

	peek(): { priority: number; value: T } | undefined {
		return this.data[0];
	}

	push(priority: number, value: T): void {
		this.data.push({ priority, value });
		this.bubbleUp();
	}

	pop(): [number, T] | undefined {
		if (this.data.length === 0) return undefined;
		if (this.data.length === 1) {
			const { priority, value } = this.data.pop()!;
			return [priority, value];
		}

		const min = this.data[0]!;
		this.data[0] = this.data.pop()!;
		this.bubbleDown();
		return [min.priority, min.value];
	}

	private bubbleUp(): void {
		let i = this.data.length - 1;

		while (i > 0) {
			const parent = Math.floor((i - 1) / 2);
			if (this.data[parent]!.priority <= this.data[i]!.priority) break;

			[this.data[i], this.data[parent]] = [this.data[parent]!, this.data[i]!];
			i = parent;
		}
	}

	private bubbleDown(): void {
		let i = 0;
		const length = this.data.length;

		while (true) {
			const left = 2 * i + 1;
			const right = 2 * i + 2;
			let smallest = i;

			if (
				left < length &&
				this.data[left]!.priority < this.data[smallest]!.priority
			) {
				smallest = left;
			}

			if (
				right < length &&
				this.data[right]!.priority < this.data[smallest]!.priority
			) {
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
