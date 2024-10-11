import { Response, File } from "@duplojs/core";
import { beforSendDefineContentTypeHook } from "./beforeSendDefineContentType";
import { createFakeRequest } from "@test/utils/request";

describe("beforeSendDefineContentType", () => {
	const request = createFakeRequest();

	it("content type already define", () => {
		const response = new Response(200, "toto", undefined).setHeader("content-type", "@test");

		beforSendDefineContentTypeHook(request, response);

		expect(response.headers["content-type"]).toBe("@test");
	});

	it("content type file", () => {
		const response = new Response(200, "toto", new File("/test.png"));

		beforSendDefineContentTypeHook(request, response);

		expect(response.headers["content-type"]).toBe("image/png");
	});

	it("content type file", () => {
		const response = new Response(200, "toto", {});

		beforSendDefineContentTypeHook(request, response);

		expect(response.headers["content-type"]).toBe("application/json; charset=utf-8");
	});

	it("content type text", () => {
		const response = new Response(200, "toto", "@test");

		beforSendDefineContentTypeHook(request, response);

		expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
	});

	it("content type null", () => {
		const response = new Response(200, "toto", null);

		beforSendDefineContentTypeHook(request, response);

		expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
	});

	it("content type number", () => {
		const response = new Response(200, "toto", 123);

		beforSendDefineContentTypeHook(request, response);

		expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
	});
});
