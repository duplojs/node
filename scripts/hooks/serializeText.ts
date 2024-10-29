import type { CurrentRequestObject, PresetGenericResponse } from "@duplojs/core";

export function serializeTextHook(request: CurrentRequestObject, response: PresetGenericResponse) {
	const body = response.body;

	if (body instanceof Error) {
		request.raw.response.write(
			body.toString(),
		);
		return true;
	} else if (typeof body === "object") {
		request.raw.response.write(
			JSON.stringify(body),
		);
		return true;
	} else if (typeof body === "string") {
		request.raw.response.write(body);
		return true;
	} else if (typeof body === "number" || typeof body === "bigint") {
		request.raw.response.write(
			body.toString(),
		);
		return true;
	}
}
