import "@duplojs/node/globals";
import { globalValues } from "@duplojs/core";
import { getTypedKeys } from "@duplojs/utils";

it("globals", () => {
	getTypedKeys(globalValues)
		.forEach((key) => {
			expect(global[key]).toBe(globalValues[key]);
		});
});
