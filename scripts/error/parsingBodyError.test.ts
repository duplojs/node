import { ParsingBodyError } from "./parsingBodyError";

it("ParsingBodyError", () => {
	expect(new ParsingBodyError("test", "")).instanceof(Error);
});
