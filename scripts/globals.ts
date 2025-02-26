export type * from "@duplojs/core/globals";
import { globalValues } from "@duplojs/core";
import { getTypedEntries } from "@duplojs/utils";

getTypedEntries(globalValues)
	.forEach(([key, value]) => {
		global[key] = value as never;
	});
