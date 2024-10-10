import "@duplojs/node";
import { Duplo, stringToBytes, useBuilder } from "@duplojs/core";
import { existsSync } from "fs";
import { lstat, mkdir, readFile, rm } from "fs/promises";
import "@routes/docs";

describe("docs", async() => {
	const duplo = new Duplo({
		environment: "TEST",
		host: "localhost",
		port: 14092,
	});

	duplo.register(...useBuilder.getLastCreatedDuploses());

	const server = await duplo.launch();

	beforeEach(async() => {
		for (const directory of ["upload", "savedFile"]) {
			if (existsSync(directory)) {
				await rm(directory, { recursive: true });
			}

			await mkdir(directory);
		}
	});

	afterAll(async() => {
		for (const directory of ["upload", "savedFile"]) {
			if (existsSync(directory)) {
				await rm(directory, { recursive: true });
			}
		}

		server.close();
	});

	it("send file", async() => {
		const formData = new FormData();
		formData.append("accepte", "true");
		const blob = new Blob([await readFile("test/fakeFiles/1mb.png", "utf-8")]);
		formData.append(
			"docs",
			new File([blob], "avatar.png", {
				type: "image/png",
				lastModified: Date.now(),
			}),
		);

		const result = await fetch(
			"http://localhost:14092/docs",
			{
				method: "POST",
				body: formData,
			},
		);

		expect(result.status).toBe(204);
		expect(existsSync("savedFile/toto.png")).toBe(true);
		expect((await lstat("savedFile/toto.png")).size).toBe(stringToBytes("1mb"));
	});
});
