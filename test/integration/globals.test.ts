import "@duplojs/node/globals";
import { getTypedKeys, globalValues } from "@duplojs/core";

it("globals", () => {
	getTypedKeys(globalValues)
		.forEach((key) => {
			expect(global[key]).toBe(globalValues[key]);
		});
});
