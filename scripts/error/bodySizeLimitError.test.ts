import { BodySizeLimitError } from "./bodySizeLimitError";

it("BodySizeLimitError", () => {
	expect(new BodySizeLimitError()).instanceof(Error);
});
