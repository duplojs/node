import { WrongTypeChunk } from "./wrongTypeChunk";

it("WrongTypeChunk", () => {
	expect(new WrongTypeChunk()).instanceof(Error);
});
