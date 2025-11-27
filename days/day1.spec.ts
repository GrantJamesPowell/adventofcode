import { test } from 'bun:test';
import { readFileSync } from 'fs';

const input = readFileSync('./inputs/day1.txt', 'utf-8');

test('finds the output', () => {
  let list1 = input.split('\n').map(line => line.split(/\s+/));
  console.log(list1);
})
