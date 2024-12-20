import "@duplojs/node";
import { Duplo, stringToBytes, useBuilder } from "@duplojs/core";
import { existsSync } from "fs";
import { lstat, mkdir, readdir, readFile, rm } from "fs/promises";
import "@routes/docs";

describe("docs", async() => {
	const duplo = new Duplo({
		environment: "TEST",
		host: "localhost",
		port: 14092,
		bodySizeLimit: "1.1mb",
		recieveFormDataOptions: {
			uploadDirectory: "test/upload/docs",
		},
	});

	duplo.register(...useBuilder.getLastCreatedDuploses());

	const server = await duplo.launch();

	beforeEach(async() => {
		for (const directory of ["test/upload/docs", "test/savedFile/docs"]) {
			if (existsSync(directory)) {
				await rm(directory, { recursive: true });
			}

			await mkdir(directory);
		}
	});

	afterAll(async() => {
		for (const directory of ["test/upload/docs", "test/savedFile/docs"]) {
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
		expect(existsSync("test/savedFile/docs/toto.png")).toBe(true);
		expect((await lstat("test/savedFile/docs/toto.png")).size).toBe(stringToBytes("1mb"));
	});

	it("send file but not accepte", async() => {
		const formData = new FormData();
		formData.append("accepte", "false");
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
		expect((await readdir("test/upload/docs")).length).toBe(0);
	});

	it("send file body size exceeds", async() => {
		const formData = new FormData();
		const blob = new Blob([await readFile("test/fakeFiles/2mb.png", "utf-8")]);
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

		expect(result.headers.get("information")).toBe("BODY_SIZE_EXCEEDS");
		expect((await readdir("test/upload/docs")).length).toBe(0);
	});

	it("send file error parsing body", async() => {
		const formData = new FormData();
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
				headers: {
					"content-type": "multipart/form-data",
				},
				body: formData,
			},
		);

		expect(result.headers.get("information")).toBe("PARSING_BODY_ERROR");
		expect((await readdir("test/upload/docs")).length).toBe(0);
	});
});
