import { getTypedKeys, globalValues } from "@duplojs/core";
import "@scripts/globals";

it("globals", () => {
	getTypedKeys(globalValues)
		.forEach((key) => {
			expect(global[key]).toBe(globalValues[key]);
		});
});
