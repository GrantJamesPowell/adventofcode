import { readFileSync } from "fs";
import { test, expect } from "bun:test";

const data = readFileSync("./inputs/day5.txt", "utf8");

const processData = (data: string) => {
	let rules: [number, number][] = [];
	let pages: number[][] = [];

	lines: for (const line of data.trim().split("\n")) {
		const matchesRules = line.trim().match(/^(\d+)\|(\d+)$/);

		if (matchesRules !== null) {
			const [, a, b] = matchesRules;
			rules.push([Number(a), Number(b)]);
			continue lines;
		}

		const matchesUpdate = line.match(/^\d+(?:,\d+)*$/);
		if (matchesUpdate) {
			pages.push(line.split(",").map(Number));
			continue lines;
		}
	}
	const ruleMap = ruleMappings(rules);

	return { rules: ruleMap, pages };
};

type RuleMapping = Map<number, number[]>;

const ruleMappings = (rules: [number, number][]): RuleMapping => {
	const map: Map<number, number[]> = new Map();

	for (const [p1, p2] of rules) {
		const existing = map.get(p2) ?? [];
		existing.push(p1);
		existing.sort();
		map.set(p2, existing);
	}

	return map;
};

const allowedByRules = (update: number[], rules: RuleMapping): boolean => {
	const notAllowed = new Set<number>();

	for (const page of update) {
		if (notAllowed.has(page)) {
			return false;
		}

		for (const disallowed of rules.get(page) ?? []) {
			notAllowed.add(disallowed);
		}
	}

	return true;
};

const calcP1 = (data: string) => {
	const { rules, pages } = processData(data);

	return pages
		.filter((p) => allowedByRules(p, rules))
		.map((p) => {
			const idx = Math.floor(p.length / 2);
			return p[idx]!;
		})
		.reduce((acc, x) => acc + x);
};
const testRules = `
47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13

75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47
  `.trim();

test("p1", () => {
	const t = processData(testRules);

	// In the above example, the first update (75,47,61,53,29) is in the right order:
	expect(allowedByRules([75, 47, 61, 53, 29], t.rules)).toEqual(true);
	expect(allowedByRules([97, 61, 53, 29, 13], t.rules)).toEqual(true);
	expect(allowedByRules([75, 29, 13], t.rules)).toEqual(true);

	// The fourth update, 75,97,47,61,53, is not in the correct order: it would print 75 before 97, which violates the rule 97|75.
	expect(allowedByRules([75, 97, 47, 61, 53], t.rules)).toEqual(false);
	// The fifth update, 61,13,29, is also not in the correct order, since it breaks the rule 29|13
	expect(allowedByRules([61, 13, 29], t.rules)).toEqual(false);
	// The last update, 97,13,75,29,47, is not in the correct order due to breaking several rules.
	expect(allowedByRules([97, 13, 75, 29, 47], t.rules)).toEqual(false);

	expect(t.pages.length).toEqual(6);

	expect(calcP1(testRules)).toEqual(143);

	expect(calcP1(data)).toEqual(5948);
});

const calcP2 = (data: string) => {
	const { rules, pages } = processData(data);

	return pages
		.filter((p) => !allowedByRules(p, rules))
		.map((s) => calcOrdering(s, rules))
		.map((ordered) => {
			let idx = Math.floor(ordered.length / 2);
			return ordered[idx]!;
		})
		.reduce((acc, next) => acc + next);
};

const calcOrdering = (input: number[], rules: RuleMapping): number[] => {
  let remaining = [...input];
  let output: number[] = [];

  const canAppear = (num: number): boolean => {
    const mustBeAfter = rules.get(num) ?? [];
    return mustBeAfter.every(x => !remaining.includes(x))
  }

  while (remaining.length > 0) {
    let next = remaining.pop()!;

    if (canAppear(next)) {
      output.push(next);
    } else {
      remaining.unshift(next);
    }
  }

  return output;
};

test("p2", () => {
	expect(calcP2(testRules)).toEqual(123);
  expect(calcP2(data)).toEqual(3062);
});
