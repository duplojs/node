export class WrongTypeChunk extends Error {
	public constructor() {
		super("Recieve chunck is not buffer or string.");
	}
}
