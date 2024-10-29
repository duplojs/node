import { createFakeRequest } from "@test/utils/request";
import { serializeTextHook } from "./serializeText";
import { Response } from "@duplojs/core";

describe("serializeText", () => {
	it("body is not serialize as text", () => {
		const spy = vi.fn().mockImplementation(() => undefined);
		const request = createFakeRequest();

		request.raw.response.write = spy;

		serializeTextHook(request, new Response(200, "@test", undefined));

		expect(spy).toHaveBeenCalledTimes(0);
	});

	it("body error", () => {
		const spy = vi.fn().mockImplementation(() => undefined);
		const request = createFakeRequest();

		request.raw.response.write = spy;

		const result = serializeTextHook(request, new Response(200, "@test", new Error("test")));

		expect(result).toBe(true);
		expect(spy).lastCalledWith("Error: test");
	});

	it("body object", () => {
		const spy = vi.fn().mockImplementation(() => undefined);
		const request = createFakeRequest();

		request.raw.response.write = spy;

		const result = serializeTextHook(request, new Response(200, "@test", { test: 1 }));

		expect(result).toBe(true);
		expect(spy).lastCalledWith(JSON.stringify({ test: 1 }));
	});

	it("body null", () => {
		const spy = vi.fn().mockImplementation(() => undefined);
		const request = createFakeRequest();

		request.raw.response.write = spy;

		const result = serializeTextHook(request, new Response(200, "@test", null));

		expect(result).toBe(true);
		expect(spy).lastCalledWith(JSON.stringify(null));
	});

	it("body string", () => {
		const spy = vi.fn().mockImplementation(() => undefined);
		const request = createFakeRequest();

		request.raw.response.write = spy;

		const result = serializeTextHook(request, new Response(200, "@test", "totot"));

		expect(result).toBe(true);
		expect(spy).lastCalledWith("totot");
	});

	it("body number", () => {
		const spy = vi.fn().mockImplementation(() => undefined);
		const request = createFakeRequest();

		request.raw.response.write = spy;

		const result = serializeTextHook(request, new Response(200, "@test", 1));

		expect(result).toBe(true);
		expect(spy).lastCalledWith("1");
	});

	it("body bigInt", () => {
		const spy = vi.fn().mockImplementation(() => undefined);
		const request = createFakeRequest();

		request.raw.response.write = spy;

		const result = serializeTextHook(request, new Response(200, "@test", 1n));

		expect(result).toBe(true);
		expect(spy).lastCalledWith("1");
	});
});
