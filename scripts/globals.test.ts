import { globalValues } from "@duplojs/core";
import { getTypedKeys } from "@duplojs/utils";
import "@scripts/globals";

it("globals", () => {
	getTypedKeys(globalValues)
		.forEach((key) => {
			expect(global[key]).toBe(globalValues[key]);
		});
});
