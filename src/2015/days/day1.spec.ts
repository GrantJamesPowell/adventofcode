import { expect, test } from "bun:test";
import { readFileSync } from 'fs';

const p1 = (input: string) => {
	let floor = 0;

	for (const instruction of input) {

		floor += ({ '(': 1, ')': -1 }[instruction] ?? 0);
	}

	return floor;
};

const p2 = (input: string) => {
  let floor = 0;

  for (const [idx, instruction] of [...input].entries()) {
		floor += ({ '(': 1, ')': -1 }[instruction] ?? 0);

    if (floor === -1) {
      return idx + 1;
    }
  }

  return null;
}


const data = readFileSync("src/2015/inputs/day1.txt", 'utf-8').trim();

test(p1.name, () => {
	expect(p1("(())")).toEqual(0);
	expect(p1("()()")).toEqual(0);
	expect(p1("(((")).toEqual(3);
	expect(p1("(()(()(")).toEqual(3);
	expect(p1("))(((((")).toEqual(3);
	expect(p1("))(")).toEqual(-1);
	expect(p1(")())())")).toEqual(-3);

  expect(p1(data)).toEqual(138);
});


test(p2.name, () => {
  expect(p2(')')).toEqual(1);
  expect(p2('()())')).toEqual(5);
  expect(p2('()()')).toEqual(null);

  expect(p2(data)).toEqual(1771);
})
