import { WrongTypeChunk } from "./wrongTypeChunkError";

it("WrongTypeChunk", () => {
	expect(new WrongTypeChunk()).instanceof(Error);
});
