import { test, expect } from "bun:test";
import { range } from "lodash";

type XmasLetter = "X" | "M" | "A" | "S";

const isLetterXmasLetter = (x: string): x is XmasLetter => `XMAS`.includes(x);

type Point = { x: number; y: number };

const asMatrix = (str: string): XmasLetter[][] =>
	str.split("\n").map((line) => line.split("").filter(isLetterXmasLetter));

const makeAt =
	(matrix: XmasLetter[][]) =>
	({ x, y }: Point): XmasLetter | null =>
		matrix[y]?.[x] ?? null;

let possibilites = (startingLetterXPoint: Point): Point[][] => {
	const { x, y } = startingLetterXPoint;
	let horizontal: Point[] = [0, 1, 2, 3].map((deltaX) => ({
		x: x + deltaX,
		y,
	}));
	let vertical: Point[] = [0, 1, 2, 3].map((deltaY) => ({ x, y: y + deltaY }));
	let diagonal: Point[] = [0, 1, 2, 3].map((delta) => ({
		x: x + delta,
		y: y + delta,
	}));

	return [horizontal, vertical, diagonal];
};

let countXmas = (str: string): number => {
	let result = 0;

	let matrix = asMatrix(str);
	let at = makeAt(matrix);

	for (const y of range(0, matrix.length)) {
		for (const x of range(0, matrix[0]!.length)) {
			let point: Point = { x, y };

			if (at(point) === "X") {
				const matches = possibilites(point).filter(
					(points) =>
						points
							.map(at)
							.filter((x) => x !== null)
							.join("") === "XMAS",
				);

				result += matches.length;
			} else {
				continue;
			}
		}
	}

	return result;
};

test("pt1", () => {
	// One dimension
	expect(countXmas("")).toEqual(0);
	expect(countXmas("X")).toEqual(0);
	expect(countXmas("XMA")).toEqual(0);
	expect(countXmas("XMAS")).toEqual(1);

	let twoDHorizontal = `
XMAS
XMAS`.trim();
	expect(asMatrix(twoDHorizontal)).toEqual([
		["X", "M", "A", "S"],
		["X", "M", "A", "S"],
	]);
	expect(countXmas(twoDHorizontal)).toEqual(2);

	let twoDVertical = `
XX
MM
AA
SS`.trim();
	expect(countXmas(twoDVertical)).toEqual(2);

	let twoDDiagonal = `
XXXX
XMMX
XAAX
SXXS`.trim();
	expect(countXmas(twoDDiagonal)).toEqual(2);

	let testCase = `
MMMSXXMASM
MSAMXMSMSA
AMXSXMAAMM
MSAMASMSMX
XMASAMXAMM
XXAMMXXAMA
SMSMSASXSS
SAXAMASAAA
MAMMMXMMMM
MXMXAXMASX
`.trim();

	expect(countXmas(testCase)).toEqual(18);
});
