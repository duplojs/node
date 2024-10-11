import { type CurrentRequestObject, type PresetGenericResponse, File } from "@duplojs/core";
import { createReadStream } from "fs";

export async function serializeFileHook(request: CurrentRequestObject, response: PresetGenericResponse) {
	const body = response.body;

	if (!(body instanceof File)) {
		return;
	}

	await new Promise<void>((resolve, reject) => {
		createReadStream(body.path)
			.pipe(
				request.raw.response
					.once("error", reject)
					.once("close", resolve),
			);
	});

	return true;
}
