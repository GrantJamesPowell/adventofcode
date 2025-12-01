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
	lowPoints(grid)
		.map((point) => point.val + 1)
		.reduce((acc, next) => acc + next, 0);

const point2str = ({ x, y }: Point) => `${x}:${y}`;

const p2 = (grid: Grid): number => {
	const at = ({ x, y }: Point) => grid[y]?.[x] ?? null;

	const seen: Set<string> = new Set();

	const fill = (point: Point): number => {
		if (seen.has(point2str(point))) {
			return 0;
		}

		seen.add(point2str(point));

		let size = 1;

		for (const adjPoint of adjPointsOf(point)) {
			const adjValue = at(adjPoint);

			if (adjValue !== null && adjValue !== 9) {
				size += fill(adjPoint);
			}
		}

		return size;
	};

	let basinSizes: number[] = [];

	for (const point of lowPoints(grid)) {
		const size = fill(point);
		basinSizes.push(size);
	}

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
