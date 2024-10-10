import { type CurrentRequestObject, type PresetGenericResponse, File } from "@duplojs/core";

export function beforSendDefineContentTypeHook(request: CurrentRequestObject, response: PresetGenericResponse) {
	if (response.headers["content-type"]) {
		return;
	}

	const body = response.body;

	if (body instanceof File) {
		response.headers["content-type"] = body.informations.mimeType || "text/plain; charset=utf-8";
	} else if (body && typeof body === "object") {
		response.headers["content-type"] = "application/json; charset=utf-8";
	} else if (
		typeof body === "number"
		|| typeof body === "string"
		|| body === null
	) {
		response.headers["content-type"] = "text/plain; charset=utf-8";
	}
}
