import { expect, test } from "bun:test";
import { readFileSync } from "fs";
import _ from "lodash";

const testData = `
kh-tc
qp-kh
de-cg
ka-co
yn-aq
qp-ub
cg-tb
vc-aq
tb-ka
wh-tc
yn-cg
kh-ub
ta-co
de-co
tc-td
tb-wq
wh-td
ta-ka
td-qp
aq-cg
wq-ub
ub-vc
de-ta
wq-aq
wq-vc
wh-yn
ka-de
kh-ta
co-tc
wh-qp
tb-vc
td-yn
`.trim();
const data = readFileSync("./inputs/day23.txt", "utf8").trim();

type Links = Map<string, Set<string>>;

const parseLinks = (input: string): Links => {
	const result: Links = new Map();

	for (const line of input.split("\n")) {
		const [a, b, ...rest] = line.split("-");

		if (a === undefined || b === undefined || rest.length !== 0) {
			throw new Error(`Invalid line "${line}"`);
		}

		let a2b = result.get(a) ?? new Set();
		a2b.add(b);
		result.set(a, a2b);

		let b2a = result.get(b) ?? new Set();
		b2a.add(a);
		result.set(b, b2a);
	}

	return result;
};

function* triples(str: string): Generator<[string, string, string]> {
	const links = parseLinks(str);

	for (const [parent, connected] of _.sortBy([...links], ([p, _]) => p)) {
		for (const child of [...connected]
			.sort()
			.filter((child) => child > parent)) {
			const grandChildren = links.get(child) ?? new Set();
			for (const grandChild of [...grandChildren]
				.sort()
				.filter((gc) => gc > child)) {
				yield [parent, child, grandChild];
			}
		}
	}
}

test("pt1", () => {
	expect([...triples(testData)].map((x) => x.join(","))).toEqual([
		"aq,cg,yn",
		"aq,vc,wq",
		"co,de,ka",
		"co,de,ta",
		"co,ka,ta",
		"de,ka,ta",
		"kh,qp,ub",
		"qp,td,wh",
		"tb,vc,wq",
		"tc,td,wh",
		"td,wh,yn",
		"ub,vc,wq",
	]);
});
