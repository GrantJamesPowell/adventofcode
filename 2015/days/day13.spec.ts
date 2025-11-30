import { readFileSync } from "fs";
import { test, expect } from "bun:test";
const data = readFileSync("./2015/inputs/day13.txt", "utf8").trim();

const testData = `
Alice would gain 54 happiness units by sitting next to Bob.
Alice would lose 79 happiness units by sitting next to Carol.
Alice would lose 2 happiness units by sitting next to David.
Bob would gain 83 happiness units by sitting next to Alice.
Bob would lose 7 happiness units by sitting next to Carol.
Bob would lose 63 happiness units by sitting next to David.
Carol would lose 62 happiness units by sitting next to Alice.
Carol would gain 60 happiness units by sitting next to Bob.
Carol would gain 55 happiness units by sitting next to David.
David would gain 46 happiness units by sitting next to Alice.
David would lose 7 happiness units by sitting next to Bob.
David would gain 41 happiness units by sitting next to Carol.
`.trim();

type Graph = Map<string, Map<string, number>>;

const parse = (str: string): Graph  => {
  const graph: Graph = new Map();

  for (const line of str.split("\n")) {
    const words = line.replaceAll('.', '').split(' ');

    const from = words[0];
    const direction = words[2];
    const amount = words[3];
    const whom = words.at(-1);

    if (!graph.has(from!)) {
      graph.set(from!, new Map());
    }

    graph.get(from!)!.set(whom!, Number(amount) * (direction === 'gain' ? 1 : -1));

  }

  return graph;
}

test('pt1', () => {
  const graph = parse(testData)
  console.log(graph);
});
