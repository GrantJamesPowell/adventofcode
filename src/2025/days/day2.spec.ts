import { expect, test } from "bun:test";
import _ from "lodash";

const parse = (data: string): [number, number][] =>
	data
		.trim()
		.split(",")
		.map((tuple) => tuple.split("-").map(Number))
		.map(([start, end]) => [start!, end!] as const);

const testData = parse(
	`11-22,95-115,998-1012,1188511880-1188511890,222220-222224,1698522-1698528,446443-446449,38593856-38593862,565653-565659,824824821-824824827,2121212118-2121212124`,
);

const data = parse(
	`385350926-385403705,48047-60838,6328350434-6328506208,638913-698668,850292-870981,656-1074,742552-796850,4457-6851,138-206,4644076-4851885,3298025-3353031,8594410816-8594543341,396-498,1558-2274,888446-916096,12101205-12154422,2323146444-2323289192,37-57,101-137,46550018-46679958,79-96,317592-341913,495310-629360,33246-46690,14711-22848,1-17,2850-4167,3723700171-3723785996,190169-242137,272559-298768,275-365,7697-11193,61-78,75373-110112,425397-451337,9796507-9899607,991845-1013464,77531934-77616074`.trim(),
);

function* range(start: number, stop: number) {
	for (let i = start; i <= stop; i++) {
		yield i;
	}
}

const isInvalidP1 = (id: number): boolean => {
	let characters = `${id}`;

	if (characters.length % 2 === 0) {
		const midPoint = characters.length / 2;
		const begin = characters.slice(0, midPoint);
		const end = characters.slice(midPoint);
		return begin === end;
	}

	return false;
};

const isInvalidP2 = (id: number): boolean => {
	const idStr = `${id}`;

  if (idStr.length % 2 !== 0) {
    return false;
  }

	for (let i = 1; i <= Math.floor(idStr.length / 2); i++) {
		let pattern = idStr.slice(0, i);

		if (pattern.repeat(idStr.length / pattern.length) === idStr) {
			return true;
		}
	}

	return false;
};

const addInvalidIds =
	(discriminator: (x: number) => boolean) =>
	(ranges: [number, number][]): number =>
		ranges
			.values()
			.flatMap(([start, stop]) => range(start, stop))
			.filter((id) => discriminator(id))
			.reduce((acc, next) => acc + next, 0);

const p1 = addInvalidIds(isInvalidP1);
const p2 = addInvalidIds(isInvalidP2);

test(isInvalidP1.name, () => {
	const invalid: number[] = [11, 22, 99, 1010, 1188511885];

	for (const id of invalid) {
		expect(isInvalidP1(id)).toEqual(true);
	}

	const validIds = [1, 123, 1234, 1188511880];

	for (const id of validIds) {
		expect(isInvalidP1(id)).toEqual(false);
	}
});

test(p1.name, () => {
	expect(p1(testData)).toEqual(1227775554);
	expect(p1(data)).toEqual(28846518423);
});

test(p2.name, () => {
	expect(p2(testData)).toEqual(4174379265);
	expect(p2(data)).toEqual(31578210022);
});
