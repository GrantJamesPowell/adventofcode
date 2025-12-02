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
const data = readFileSync("src/2024/inputs/day23.txt", "utf8").trim();

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

	for (const [parent, children] of _.sortBy([...links], ([p, _]) => p)) {
		for (const child of [...children]
			.sort()
			.filter((child) => child > parent)) {
			const grandChildren = links.get(child) ?? new Set();

			for (const grandChild of [...grandChildren]
				.sort()
				.filter((gc) => gc > child)) {
				const greatGrandChildren = links.get(grandChild) ?? new Set();

				if (greatGrandChildren.has(parent)) {
					yield [parent, child, grandChild];
				}
			}
		}
	}
}

const part1 = (str: string): number =>
	[...triples(str)].filter((node) => node.some((name) => name.startsWith("t")))
		.length;

const interconnectedSets = (graph: Links): Set<string> => {
	let best: Set<string> = new Set();

	const bronKerbosch = (R: Set<string>, P: Set<string>, X: Set<string>) => {
		// Maximal clique found
		if (P.size === 0 && X.size === 0) {
			if (R.size > best.size) best = new Set(R);
			return;
		}

		// Choose pivot u from P ∪ X
		const unionPX = P.union(X);
		const u = unionPX.values().next().value as string;
		const neighborsU = graph.get(u)!;

		// Only explore vertices not adjacent to pivot
		const toExplore = [...P.difference(neighborsU)];

		for (const v of toExplore) {
			const neighborsV = graph.get(v)!;

			bronKerbosch(
				R.union(new Set([v])),
				P.intersection(neighborsV),
				X.intersection(neighborsV),
			);

			// Remove from P & add to X
			P.delete(v);
			X.add(v);
		}
	};

	const allNodes = new Set(graph.keys());
	bronKerbosch(new Set(), allNodes, new Set());

	return best;
};

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

	expect(part1(testData)).toEqual(7);
	expect(part1(data)).toEqual(1156);
});

test("pt2", () => {
	expect(interconnectedSets(parseLinks(testData))).toEqual(
		new Set(["de", "co", "ta", "ka"]),
	);

	// expect(
	// 	interconnectedSets(parseLinks(data)).keys().toArray().sort().join(","),
	// ).toEqual("bx,cx,dr,dx,is,jg,km,kt,li,lt,nh,uf,um");
});
