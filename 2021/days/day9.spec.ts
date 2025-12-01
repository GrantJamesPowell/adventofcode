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

const adjPoints = ({ x, y }: Point): Point[] => [
	{ x: x - 1, y },
	{ x: x + 1, y },
	{ x, y: y + 1 },
	{ x, y: y - 1 },
];

const p1 = (grid: Grid): number => {
	const isLowPoint = (point: Point & { val: number }): boolean =>
		adjPoints(point)
			.map((adj) => grid[adj.y]?.[adj.x] ?? null)
			.filter((adjValue) => adjValue !== null)
			.every((adjValue) => adjValue > point.val);

	return pointsOf(grid)
		.filter(isLowPoint)
		.map((point) => point.val + 1)
		.reduce((acc, next) => acc + next, 0);
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
