import { createFakeRequest } from "@tests/utils/request";
import { makeParsingBodyTextHook } from "./parsingBodyText";
import { ParsingBodyError } from "@scripts/error/parsingBodyError";
import { BodySizeLimitError } from "@scripts/error/bodySizeLimitError";

describe("parsingBodyTextHook", () => {
	it("content type is not text or json", async() => {
		const parsingBodyTextHook = makeParsingBodyTextHook({
			bodySizeLimit: 50000,
		} as any);

		const request = createFakeRequest();

		await parsingBodyTextHook(request);

		expect(request.body).toBe(undefined);
	});

	it("error chunck is not a string", async() => {
		const parsingBodyTextHook = makeParsingBodyTextHook({
			bodySizeLimit: 50000,
		} as any);

		const request = createFakeRequest({
			headers: {
				"content-type": "text/plain",
			},
		});

		setTimeout(() => {
			request.raw.request.emit("data", 2);
		});

		await expect(() => parsingBodyTextHook(request)).rejects.toThrowError(ParsingBodyError);
	});

	it("error chunck is not a string", async() => {
		const parsingBodyTextHook = makeParsingBodyTextHook({
			bodySizeLimit: 1,
		} as any);

		const request = createFakeRequest({
			headers: {
				"content-type": "text/plain",
			},
		});

		setTimeout(() => {
			request.raw.request.emit("data", "tototototo");
		});

		await expect(() => parsingBodyTextHook(request)).rejects.toThrowError(BodySizeLimitError);
	});

	it("receive text", async() => {
		const parsingBodyTextHook = makeParsingBodyTextHook({
			bodySizeLimit: 1000,
		} as any);

		const request = createFakeRequest({
			headers: {
				"content-type": "text/plain",
			},
		});

		setTimeout(() => {
			request.raw.request.emit("data", "tototototo");
			request.raw.request.emit("end");
		});

		await parsingBodyTextHook(request);

		expect(request.body).toBe("tototototo");
	});

	it("error bad json", async() => {
		const parsingBodyTextHook = makeParsingBodyTextHook({
			bodySizeLimit: 1000,
		} as any);

		const request = createFakeRequest({
			headers: {
				"content-type": "application/json",
			},
		});

		setTimeout(() => {
			request.raw.request.emit("data", "tototototo");
			request.raw.request.emit("end");
		});

		await expect(() => parsingBodyTextHook(request)).rejects.toThrowError(ParsingBodyError);
	});

	it("receive json", async() => {
		const parsingBodyTextHook = makeParsingBodyTextHook({
			bodySizeLimit: 1000,
		} as any);

		const request = createFakeRequest({
			headers: {
				"content-type": "application/json",
			},
		});

		setTimeout(() => {
			request.raw.request.emit("data", "{\"toto\":1}");
			request.raw.request.emit("end");
		});

		await parsingBodyTextHook(request);

		expect(request.body).toStrictEqual({
			toto: 1,
		});
	});
});
