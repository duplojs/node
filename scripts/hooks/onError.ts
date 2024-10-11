import { BadRequestHttpResponse, type CurrentRequestObject, PayloadTooLargeHttpResponse } from "@duplojs/core";
import { ParsingBodyError } from "@scripts/error/parsingBodyError";
import { BodySizeLimitError } from "@scripts/error/bodySizeLimitError";

export function onErrorHook(request: CurrentRequestObject, error: unknown) {
	if (error instanceof BodySizeLimitError) {
		return new PayloadTooLargeHttpResponse("BODY_SIZE_EXCEEDS");
	} else if (error instanceof ParsingBodyError) {
		return new BadRequestHttpResponse("PARSING_BODY_ERROR");
	}
}
