/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type * as fileSysteme from "fs";
import type * as fileSystemePromise from "fs/promises";
import type { Mock } from "vitest";

const original = Symbol("original");

vi.mock(
	"fs",
	async(importOriginal) => {
		const fs = await importOriginal() as object;

		return Object.fromEntries([
			...Object
				.keys(fs)
				.map((key) => [key, vi.fn()]),
			[original, fs],
		]);
	},
);

vi.mock(
	"fs/promises",
	async(importOriginal) => {
		const fsPromise = await importOriginal() as object;

		return Object.fromEntries([
			...Object
				.keys(fsPromise)
				.map((key) => [key, vi.fn()]),
			[original, fsPromise],
		]);
	},
);

export const fsSpy: Record<keyof typeof fileSysteme, Mock> = await import("fs") as any;
export const fspSpy: Record<keyof typeof fileSystemePromise, Mock> = await import("fs/promises") as any;
export function fsSpyResetMock() {
	Object.values(fsSpy).forEach((value) => {
		value.mockReset();
	});
}

export function fspSpyResetMock() {
	Object.values(fspSpy).forEach((value) => {
		value.mockReset();
	});
}

export const fs: typeof fileSysteme = (fsSpy as any)[original] as any;
export const fsp: typeof fileSystemePromise = (fspSpy as any)[original] as any;
