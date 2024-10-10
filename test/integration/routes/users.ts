import { OkHttpResponse, useBuilder, zod, zoderce } from "@duplojs/core";

useBuilder()
	.createRoute("GET", "/users")
	.extract({
		query: {
			page: zoderce
				.number()
				.default(0),
			take: zoderce
				.number()
				.max(50)
				.default(10),
			ignoredUserId: zod
				.string()
				.default("toto")
				.toArray(),
		},
	})
	.handler(
		(pickup) => new OkHttpResponse(
			"users",
			pickup(["ignoredUserId", "page", "take"]),
		),
	);

useBuilder()
	.createRoute("POST", "/users")
	.extract({
		body: zod.object({
			name: zod.string(),
			age: zod.number(),
		}).strip(),
	})
	.handler((pickup) => new OkHttpResponse(
		"userCreated",
		pickup("body"),
	));
