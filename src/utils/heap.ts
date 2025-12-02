export class MinHeap<T> {
	private data: Array<{ priority: number; value: T }> = [];

	size(): number {
		return this.data.length;
	}

	peek(): { priority: number; value: T } | undefined {
		return this.data[0];
	}

	push(priority: number, value: T): void {
		this.data.push({ priority, value });
		this.bubbleUp();
	}

	pop(): [number, T] | undefined {
		if (this.data.length === 0) return undefined;
		if (this.data.length === 1) {
			const { priority, value } = this.data.pop()!;
			return [priority, value];
		}

		const min = this.data[0]!;
		this.data[0] = this.data.pop()!;
		this.bubbleDown();
		return [min.priority, min.value];
	}

	private bubbleUp(): void {
		let i = this.data.length - 1;

		while (i > 0) {
			const parent = Math.floor((i - 1) / 2);
			if (this.data[parent]!.priority <= this.data[i]!.priority) break;

			[this.data[i], this.data[parent]] = [this.data[parent]!, this.data[i]!];
			i = parent;
		}
	}

	private bubbleDown(): void {
		let i = 0;
		const length = this.data.length;

		while (true) {
			const left = 2 * i + 1;
			const right = 2 * i + 2;
			let smallest = i;

			if (
				left < length &&
				this.data[left]!.priority < this.data[smallest]!.priority
			) {
				smallest = left;
			}

			if (
				right < length &&
				this.data[right]!.priority < this.data[smallest]!.priority
			) {
				smallest = right;
			}

			if (smallest === i) break;

			[this.data[i], this.data[smallest]] = [
				this.data[smallest]!,
				this.data[i]!,
			];
			i = smallest;
		}
	}
}
