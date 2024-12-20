import { type DuploConfig, type CurrentRequestObject } from "@duplojs/core";
import { BodySizeLimitError } from "@scripts/error/bodySizeLimitError";
import { ParsingBodyError } from "@scripts/error/parsingBodyError";
import { WrongTypeChunk } from "@scripts/error/wrongTypeChunkError";

export function makeParsingBodyTextHook(config: DuploConfig) {
	const { bodySizeLimit } = config;

	return async function parsingBodyTextHook(request: CurrentRequestObject) {
		const contentType = request.headers["content-type"] instanceof Array
			? request.headers["content-type"].join(", ")
			: request.headers["content-type"] ?? "";

		const isText = contentType.includes("text/plain");
		const isJson = contentType.includes("application/json");

		if (!isText && !isJson) {
			return;
		}

		request.body = await new Promise<unknown>(
			(resolve, reject) => {
				function errorCallback(error: unknown) {
					if (error instanceof BodySizeLimitError) {
						reject(error);
						return;
					}
					reject(new ParsingBodyError(contentType, error));
				}

				let stringBody = "";
				let byteLengthBody = 0;

				request.raw.request.on("error", errorCallback);

				request.raw.request.on("data", (chunck) => {
					if (!(chunck instanceof Buffer) && typeof chunck !== "string") {
						request.raw.request.emit("error", new WrongTypeChunk());
						return;
					}

					byteLengthBody += chunck instanceof Buffer
						? chunck.byteLength
						: Buffer.byteLength(chunck);

					if (byteLengthBody > bodySizeLimit) {
						request.raw.request.emit("error", new BodySizeLimitError());
						return;
					}
					stringBody += chunck.toString();
				});

				request.raw.request.on("end", () => {
					try {
						resolve(isText ? stringBody : JSON.parse(stringBody));
					} catch (error) {
						errorCallback(error);
					}
				});
			},
		);

		return true;
	};
}
