import "@duplojs/node";
import { Duplo, InternalServerErrorHttpResponse } from "@duplojs/core";

describe("notfound", () => {
	it("default not found", async() => {
		const duplo = new Duplo({
			environment: "TEST",
			host: "localhost",
			port: 14093,
		});

		const server = await duplo.launch();

		const result = await fetch(
			"http://localhost:14093/",
			{
				method: "GET",
			},
		);

		expect(result.status).toBe(404);
		expect(result.headers.get("information")).toBe("NOTFOUND");

		server.close();
	});

	it("custom handler", async() => {
		const duplo = new Duplo({
			environment: "TEST",
			host: "localhost",
			port: 14093,
		});

		duplo.setNotfoundHandler(() => new InternalServerErrorHttpResponse("bla"));

		const server = await duplo.launch();

		const result = await fetch(
			"http://localhost:14093/",
			{
				method: "GET",
			},
		);

		expect(result.status).toBe(500);
		expect(result.headers.get("information")).toBe("bla");

		server.close();
	});
});
