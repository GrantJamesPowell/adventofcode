import { readFileSync } from "fs";
import { test, expect } from "bun:test";
import _, { range } from "lodash";

const data = readFileSync("./inputs/day6.txt", "utf8");

const testData = `
....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...
`.trim();

type Dir = "N" | "E" | "S" | "W";
type Point = { x: number; y: number };

type Terrain = "#" | ".";

const point2Str = ({ x, y }: Point): string => `${x}:${y}`;
const str2Point = (str: string): Point => {
	const [x, y] = str.split(":");
	return { x: Number(x), y: Number(y) };
};

let parseData = (data: string) => {
	let positions: Map<string, Terrain> = new Map();
	let curr: Point | null = null;
	let dir: Dir | null = null;
	let width = 0;

	let lines = data.trim().split("\n");

	for (const [y, line] of lines.entries()) {
		const cols = line.split("");
		width = Math.max(cols.length, width);

		for (const [x, val] of cols.entries()) {
			switch (val) {
				case "^": {
					curr = { x, y };
					positions.set(point2Str({ x, y }), ".");
					dir = "N";
					break;
				}
				case "#":
				case ".": {
					positions.set(point2Str({ x, y }), val);
					break;
				}
				default:
					throw new Error(`Inavlid char ${val}`);
			}
		}
	}

	if (curr == null || dir == null) {
		throw new Error("No current direction or starting position");
	}

	return { curr, dir, positions, width, height: lines.length };
};

const nextPoint = ({ x, y }: Point, dir: Dir): Point => {
	switch (dir) {
		// NOTE North is negative since the origin is top left
		case "N":
			return { x, y: y - 1 };
		case "S":
			return { x, y: y + 1 };
		case "E":
			return { x: x + 1, y };
		case "W":
			return { x: x - 1, y };
	}
};

const turnRight = (dir: Dir): Dir => {
	switch (dir) {
		case "N":
			return "E";
		case "E":
			return "S";
		case "S":
			return "W";
		case "W":
			return "N";
	}
};

const calcUniquePositions = (data: string): number => {
	const starting = parseData(data);

	let unique = new Set<string>();
	unique.add(point2Str(starting.curr));

	let curr: Point = starting.curr;
	let dir: Dir = starting.dir;

	let step = 0;

	walking: while (true) {
		// console.log(
		// 	printCurrent({ curr, dir, unique, positions: starting.positions }),
		// );
		step++;
		let next = nextPoint(curr, dir);

		switch (starting.positions.get(point2Str(next)) ?? null) {
			case ".": {
				unique.add(point2Str(next));
				curr = next;
				continue walking;
			}
			case "#": {
				dir = turnRight(dir);
				continue walking;
			}
			case null: {
				break walking;
			}
			default:
				throw new Error("Unreachable");
		}
	}

	return unique.size;
};

const printCurrent = (params: {
	unique: Set<string>;
	positions: Map<string, Terrain>;
	curr: Point;
	dir: Dir;
}) => {
	const { unique, positions, curr, dir } = params;
	const points = [...positions].map(([key, _val]) => str2Point(key));
	const height = _.max(points.map((point) => point.y)) ?? 0;
	const width = _.max(points.map((point) => point.x)) ?? 0;

	let result = "";

	for (const y of _.range(0, height + 1)) {
		result += `${y.toString()}: `;
		for (const x of _.range(0, width + 1)) {
			if (curr.x === x && curr.y === y) {
				switch (dir) {
					case "N":
						result += "↑";
						break;
					case "E":
						result += "→";
						break;
					case "S":
						result += "↓";
						break;
					case "W":
						result += "←";
						break;
				}
			} else if (unique.has(point2Str({ x, y }))) {
				result += "X";
			} else {
				result += positions.get(point2Str({ x, y })) ?? "?";
			}
		}
		result += "\n";
	}

	return result;
};

test("p1", () => {
	expect(calcUniquePositions(testData)).toEqual(41);
	expect(calcUniquePositions(data)).toEqual(4515);
});
