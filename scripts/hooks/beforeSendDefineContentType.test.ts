import { Response, File } from "@duplojs/core";
import { beforSendDefineContentType } from "./beforeSendDefineContentType";
import { createFakeRequest } from "@tests/utils/request";

describe("beforeSendDefineContentType", () => {
	const request = createFakeRequest();

	it("content type already define", () => {
		const response = new Response(200, "toto", undefined).setHeader("content-type", "test");

		beforSendDefineContentType(request, response);

		expect(response.headers["content-type"]).toBe("test");
	});

	it("content type file", () => {
		const response = new Response(200, "toto", new File("/test.png"));

		beforSendDefineContentType(request, response);

		expect(response.headers["content-type"]).toBe("image/png");
	});

	it("content type file", () => {
		const response = new Response(200, "toto", {});

		beforSendDefineContentType(request, response);

		expect(response.headers["content-type"]).toBe("application/json; charset=utf-8");
	});

	it("content type text", () => {
		const response = new Response(200, "toto", "test");

		beforSendDefineContentType(request, response);

		expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
	});

	it("content type null", () => {
		const response = new Response(200, "toto", null);

		beforSendDefineContentType(request, response);

		expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
	});

	it("content type number", () => {
		const response = new Response(200, "toto", 123);

		beforSendDefineContentType(request, response);

		expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
	});
});
