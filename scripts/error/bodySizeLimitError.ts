export class BodySizeLimitError extends Error {
	public constructor() {
		super("Body size is bigger than the allowed limit.");
	}
}
