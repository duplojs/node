import { safeDecodeURIComponent } from "./safeDecodeURIComponent";

describe("safeDecodeURI", () => {
	it("should decode URI with special characters", () => {
		const encodedURI = "caf%C3%A9";
		const result = safeDecodeURIComponent(encodedURI);
		expect(result).toBe("café");
	});

	it("should decode URI with path separators", () => {
		const encodedURI = "/path%2Fto%2Ffile.txt";
		const result = safeDecodeURIComponent(encodedURI);
		expect(result).toBe("/path/to/file.txt");
	});

	it("should return original string when decoding fails", () => {
		const invalidEncodedURI = "Hello%World";
		const result = safeDecodeURIComponent(invalidEncodedURI);
		expect(result).toBe("Hello%World");
	});

	it("should decode URI with nomal path", () => {
		const encodedURI = "/t%C3%A9st/1?test=caf%C3%A9";
		const result = safeDecodeURIComponent(encodedURI);
		expect(result).toBe("/tést/1?test=café");
	});
});
