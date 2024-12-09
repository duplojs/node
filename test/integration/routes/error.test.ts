import "@duplojs/node";
import { Duplo, useBuilder } from "@duplojs/core";
import "./error";

describe("error", async() => {
	const duplo = new Duplo({
		environment: "TEST",
		host: "localhost",
		port: 15092,
	});

	duplo.register(...useBuilder.getLastCreatedDuploses());

	const server = await duplo.launch();

	afterAll(() => {
		server.close();
	});

	it("uncatch error", async() => {
		const result1 = await fetch(
			"http://localhost:15092/uncatch-error",
			{
				method: "GET",
			},
		);

		expect(result1.status).toBe(500);
		expect(result1.headers.get("content-type")).toBe("text/plain; charset=utf-8");
		expect(await result1.text()).toBe("Error: uncatch Error.");
	});
});
