import "@duplojs/core";

declare module "@duplojs/core" {
	interface RecieveFormDataOptions {
		highWaterMark?: number;
	}
}
