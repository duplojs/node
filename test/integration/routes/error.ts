import { useBuilder } from "@duplojs/core";

useBuilder()
	.createRoute("GET", "/uncatch-error")
	.handler(() => {
		throw new Error("uncatch Error.");
	});
