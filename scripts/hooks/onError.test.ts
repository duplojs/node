import { ParsingBodyError } from "@scripts/error/parsingBodyError";
import { BodySizeLimitError } from "@scripts/error/bodySizeLimitError";
import { onErrorHook } from "./onError";

describe("onErrorHook", () => {
	it("BODY_SIZE_EXCEEDS", () => {
		const result = onErrorHook({} as any, new BodySizeLimitError());
		expect(result?.information).toBe("BODY_SIZE_EXCEEDS");
	});

	it("PARSING_BODY_ERROR", () => {
		const result = onErrorHook({} as any, new ParsingBodyError("", ""));
		expect(result?.information).toBe("PARSING_BODY_ERROR");
	});
});
