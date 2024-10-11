export class ParsingBodyError extends Error {
	public constructor(
		public contentType: string,
		public catchedError: unknown,
	) {
		super(`Error when parsing body with '${contentType}' content-type.`);
	}
}
