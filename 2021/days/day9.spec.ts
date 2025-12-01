import { expect, test } from "bun:test";
import { readFileSync } from "fs";

type Grid = number[][];

type Point = { x: number; y: number };

function* pointsOf(grid: Grid): Generator<Point & { val: number }> {
	for (const [y, row] of grid.entries()) {
		for (const [x, val] of row.entries()) {
			yield { x, y, val };
		}
	}
}

const adjPointsOf = ({ x, y }: Point) => [
	{ x: x - 1, y },
	{ x: x + 1, y },
	{ x, y: y + 1 },
	{ x, y: y - 1 },
];

const lowPoints = (grid: Grid) =>
	pointsOf(grid).filter((point) =>
		adjPointsOf(point)
			.map(({ x, y }) => grid[y]?.[x] ?? Infinity)
			.every((adjValue) => adjValue > point.val),
	);

const p1 = (grid: Grid): number =>
	lowPoints(grid).reduce((acc, point) => acc + point.val + 1, 0);

const point2str = ({ x, y }: Point) => `${x}:${y}`;

const p2 = (grid: Grid): number => {
	const seen: Set<string> = new Set();
	const at = ({ x, y }: Point) => grid[y]?.[x] ?? null;

	const bfs = (start: Point): number => {
		const queue = [start];
		let size = 0;

		while (queue.length > 0) {
			const p = queue.shift()!;

			if (seen.has(point2str(p))) {
				continue;
			}

			seen.add(point2str(p));
			const pointVal = at(p);

			if (pointVal == null || pointVal === 9) {
				continue;
			}

			size += 1;
			for (const adjPoint of adjPointsOf(p)) {
				queue.push(adjPoint);
			}
		}

		return size;
	};

	const basinSizes = lowPoints(grid)
		.map((point) => bfs(point))
		.toArray();

	return basinSizes
		.sort((a, b) => b - a)
		.slice(0, 3)
		.reduce((acc, next) => acc * next);
};

const parse = (data: string): Grid =>
	data.split("\n").map((line) => line.split("").map(Number));

const testData = parse(
	`
2199943210
3987894921
9856789892
8767896789
9899965678
`.trim(),
);

const data = parse(readFileSync("./2021/inputs/day9.txt", "utf8").trim());

test(p1.name, () => {
	expect(p1(testData)).toEqual(15);
	expect(p1(data)).toEqual(494);
});

test(p2.name, () => {
	expect(p2(testData)).toEqual(1134);
	expect(p2(data)).toEqual(1048128);
});
