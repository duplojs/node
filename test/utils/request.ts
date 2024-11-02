import { type RequestInitializationData, Request } from "@duplojs/core";
import httpMocks from "node-mocks-http";
import FormData from "form-data";

type InitializationData =
	Omit<Partial<RequestInitializationData>, "raw">
	& { body?: unknown }
	& {
		raw?: {
			request?: httpMocks.RequestOptions;
			response?: httpMocks.ResponseOptions;
		};
	};

export function createFakeRequest({ raw, ...initializationData }: InitializationData = {}) {
	const { req: request, res: response } = httpMocks.createMocks(
		raw?.request,
		raw?.response,
	);

	request.pipe = (writable: NodeJS.WritableStream) => {
		const body = raw?.request?.body;
		if (body instanceof FormData) {
			body.pipe(writable);
		}
	};

	return new Request({
		method: "GET",
		path: "/",
		headers: {},
		query: {},
		params: {},
		host: "",
		matchedPath: "/",
		origin: "",
		url: "",
		raw: {
			request,
			response,
		},
		...initializationData,
	});
}
