import "@duplojs/node";
import { Duplo, useBuilder } from "@duplojs/core";

import "@routes/users";

describe("users", async() => {
	const duplo = new Duplo({
		environment: "TEST",
		host: "localhost",
		port: 14091,
	});

	duplo.register(...useBuilder.getLastCreatedDuploses());

	const server = await duplo.launch();

	afterAll(() => {
		server.close();
	});

	it("query", async() => {
		const result1 = await fetch(
			"http://localhost:14091/users",
			{
				method: "GET",
			},
		).then((res) => res.json());

		expect(result1).toStrictEqual({
			ignoredUserId: ["toto"],
			page: 0,
			take: 10,
		});

		const result2 = await fetch(
			"http://localhost:14091/users?ignoredUserId=tutu&page=20&take=9",
			{
				method: "GET",
			},
		).then((res) => res.json());

		expect(result2).toStrictEqual({
			ignoredUserId: ["tutu"],
			page: 20,
			take: 9,
		});
	});

	it("json body", async() => {
		const result = await fetch(
			"http://localhost:14091/users",
			{
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					name: "liam",
					age: 16,
				}),
			},
		).then((res) => res.json());

		expect(result).toStrictEqual({
			name: "liam",
			age: 16,
		});
	});
});
