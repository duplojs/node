import "@duplojs/core";
import type http from "http";

export interface RawRequest {
	request: http.IncomingMessage;
	response: http.ServerResponse;
}

declare module "@duplojs/core" {
	interface DisabledExtractKey {
		raw: true;
	}
	interface RequestInitializationData {
		raw: RawRequest;
	}

	interface Request {

		/**
		 * @deprecated
		 */
		raw: RawRequest;
		attachedFilePaths?: string[];
	}
}
