export type * from "@duplojs/core/globals";
import { getTypedEntries, globalValues } from "@duplojs/core";

getTypedEntries(globalValues)
	.forEach(([key, value]) => {
		global[key] = value as never;
	});
