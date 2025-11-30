import { readFileSync } from "fs";
import { test, expect } from "bun:test";

type XmasLetter = "X" | "M" | "A" | "S";

const data = readFileSync("./2024/inputs/day4.txt", "utf8");

const isLetterXmasLetter = (x: string): x is XmasLetter => `XMAS`.includes(x);

type Point = { x: number; y: number };

const asMatrix = (str: string): XmasLetter[][] =>
	str.split("\n").map((line) => line.split("").filter(isLetterXmasLetter));

const makeAt =
	(matrix: XmasLetter[][]) =>
	({ x, y }: Point): XmasLetter | null =>
		matrix[y]?.[x] ?? null;

let wordSearchPossibilites = (startingLetterXPoint: Point): Point[][] => {
	const { x, y } = startingLetterXPoint;

	let horizontal: Point[] = [0, 1, 2, 3].map((deltaX) => ({
		x: x + deltaX,
		y,
	}));

	let horizontalBackwards: Point[] = [0, 1, 2, 3].map((deltaX) => ({
		x: x - deltaX,
		y,
	}));

	let vertical: Point[] = [0, 1, 2, 3].map((deltaY) => ({ x, y: y + deltaY }));

	let verticalBackwards: Point[] = [0, 1, 2, 3].map((deltaY) => ({
		x,
		y: y - deltaY,
	}));

	let rDiagonal: Point[] = [0, 1, 2, 3].map((delta) => ({
		x: x + delta,
		y: y + delta,
	}));

	let rDiagonalBackwards: Point[] = [0, 1, 2, 3].map((delta) => ({
		x: x - delta,
		y: y - delta,
	}));

	let lDiagonal: Point[] = [0, 1, 2, 3].map((delta) => ({
		x: x - delta,
		y: y + delta,
	}));

	let lDiagonalBackwards: Point[] = [0, 1, 2, 3].map((delta) => ({
		x: x + delta,
		y: y - delta,
	}));

	return [
		horizontal,
		horizontalBackwards,
		vertical,
		verticalBackwards,
		rDiagonal,
		rDiagonalBackwards,
		lDiagonal,
		lDiagonalBackwards,
	];
};

function* pointsOfMatrix<T>(matrix: T[][]): Generator<Point & { val: T }> {
	for (const [y, row] of matrix.entries()) {
		for (const [x, val] of row.entries()) {
			yield { x, y, val };
		}
	}
}

let countXmas = (str: string): number => {
	let matrix = asMatrix(str);
	let at = makeAt(matrix);

	const result = pointsOfMatrix(matrix)
		.filter((point) => point.val === "X")
		.flatMap(wordSearchPossibilites)
		.map((possible) => possible.map(at).join(""))
		.filter((word) => word === "XMAS")
		.reduce((n) => n + 1, 0);

	return result;
};

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

test("pt1", () => {
	// One dimension
	expect(countXmas("")).toEqual(0);
	expect(countXmas("X")).toEqual(0);
	expect(countXmas("XMA")).toEqual(0);
	expect(countXmas("XMAS")).toEqual(1);
	expect(countXmas("SAMX")).toEqual(1);

	let twoDHorizontal = `
XMAS
XMAS`.trim();
	expect(asMatrix(twoDHorizontal)).toEqual([
		["X", "M", "A", "S"],
		["X", "M", "A", "S"],
	]);
	expect(countXmas(twoDHorizontal)).toEqual(2);

	let twoDVertical = `
XS
MA
AM
SX`.trim();
	expect(countXmas(twoDVertical)).toEqual(2);

	let twoDDiagonal = `
XXXX
XMMX
XAAX
SXXS`.trim();
	expect(countXmas(twoDDiagonal)).toEqual(2);

	expect(countXmas(testCase)).toEqual(18);
	expect(countXmas(data)).toEqual(2644);
});

const countMasXd = (str: string): number => {
	const matrix = asMatrix(str);
	const at = makeAt(matrix);

	const isMas = (lhs: XmasLetter | null, rhs: XmasLetter | null): boolean => {
		let forwards = lhs === "M" && rhs === "S";
		let backwards = lhs === "S" && rhs === "M";
		return forwards || backwards;
	};

	let result: number = pointsOfMatrix(matrix)
		.filter((point) => at(point) === "A")
		.filter(({ x, y }) => {
			let topLeft = at({ x: x - 1, y: y + 1 });
			let bottomRight = at({ x: x + 1, y: y - 1 });

			let topRight = at({ x: x + 1, y: y + 1 });
			let bottomLeft = at({ x: x - 1, y: y - 1 });

			return isMas(topLeft, bottomRight) && isMas(topRight, bottomLeft);
		})
		.reduce((x) => x + 1, 0);

	return result;
};

test("pt2", () => {
	expect(countMasXd(testCase)).toEqual(9);
	expect(countMasXd(data)).toEqual(1952);
});
