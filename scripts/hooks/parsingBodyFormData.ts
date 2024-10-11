import { ReceiveFormData, ReceiveFormDataIssue, type CurrentRequestObject, type DuploConfig, File, type ReceiveFormDataExtractor } from "@duplojs/core";
import { BodySizeLimitError } from "@scripts/error/bodySizeLimitError";
import { ParsingBodyError } from "@scripts/error/parsingBodyError";
import busboy from "busboy";
import { createWriteStream } from "fs";
import path from "path";

export function makeParsingBodyFormDataHook(config: DuploConfig) {
	const { bodySizeLimit, recieveFormDataOptions } = config;

	return function parsingBodyFormDataHook(request: CurrentRequestObject) {
		const contentType = request.headers["content-type"] instanceof Array
			? request.headers["content-type"].join(", ")
			: request.headers["content-type"] ?? "";

		const isFormData = contentType.includes("multipart/form-data");

		if (!isFormData) {
			return;
		}

		const contentLength = Number(request.headers["content-length"]);

		if (contentLength > bodySizeLimit) {
			throw new BodySizeLimitError();
		}

		request.body = new ReceiveFormData(
			(params) => new Promise<Awaited<ReturnType<ReceiveFormDataExtractor>>>(
				(resolve, reject) => {
					function errorCallback(error: unknown) {
						if (error instanceof ReceiveFormDataIssue) {
							resolve(error);
							return;
						}

						reject(new ParsingBodyError(contentType, error));
					}

					try {
						const promiseList: Promise<unknown>[] = [];
						const resultFiles: Record<string, File[]> = {};
						const resultFields: Record<string, string | string[]> = {};
						const strict = params.strict ?? recieveFormDataOptions.strict;
						const highWaterMark = params.highWaterMark ?? 65536;

						const busboyPipe = busboy({
							headers: request.headers,
							highWaterMark,
						});

						if (params.files) {
							request.attachedFilePaths = [];
							const prefixTempName = params.prefixTempName ?? recieveFormDataOptions.prefixTempName;
							const uploadDirectory = params.uploadDirectory ?? recieveFormDataOptions.uploadDirectory;
							const propsFileExpected = params.files;

							busboyPipe.on(
								"file",
								(prop, filePipe, info) => {
									const propFileExpected = propsFileExpected[prop];

									if (!propFileExpected) {
										if (strict) {
											busboyPipe.emit("error", new ReceiveFormDataIssue("file", prop, "tooMutch"));
										}

										filePipe.resume();
										return;
									}

									if (!resultFiles[prop]) {
										resultFiles[prop] = [];
									}

									const files = resultFiles[prop];

									if (files.length === propFileExpected.maxQuantity) {
										if (strict) {
											busboyPipe.emit("error", new ReceiveFormDataIssue("file", prop, "qauntityExceeds"));
										}

										filePipe.resume();
										return;
									}

									const { filename, mimeType } = info;

									if (
										!propFileExpected.mimeTypes.find(
											(regExpMimeType) => regExpMimeType.test(mimeType),
										)
									) {
										busboyPipe.emit("error", new ReceiveFormDataIssue("file", prop, "wrongMimeType"));
										return;
									}

									const filePath = path.resolve(uploadDirectory, `${prefixTempName}${process.hrtime.bigint()}`);
									const file = new File(
										filePath,
										{
											name: filename,
											mimeType,
										},
									);
									files.push(file);
									request.attachedFilePaths?.push(filePath);

									const writeStream = createWriteStream(filePath, {
										flags: "a",
										highWaterMark,
									});

									filePipe.on("data", (data) => {
										const chunckByts
											= data instanceof Buffer
												|| data instanceof ArrayBuffer
												|| data instanceof SharedArrayBuffer
												|| typeof data === "string"
												? Buffer.byteLength(data)
												: highWaterMark;

										if (
											writeStream.bytesWritten + chunckByts
												> propFileExpected.maxSize
										) {
											writeStream.emit("close");
											filePipe.emit("error", new ReceiveFormDataIssue("file", prop, "sizeExceeds"));
										}
									});

									filePipe.on("error", (error) => {
										busboyPipe.emit("error", error);
									});

									writeStream.on("error", (error) => {
										busboyPipe.emit("error", error);
									});

									promiseList.push(
										new Promise((resolve) => void writeStream.on("close", resolve)),
									);

									filePipe.pipe(writeStream);
								},
							);
						}

						if (params.fields) {
							const propsFieldExpected = params.fields;

							busboyPipe.on(
								"field",
								(prop, value) => {
									if (!propsFieldExpected.includes(prop)) {
										if (strict) {
											busboyPipe.emit("error", new ReceiveFormDataIssue("field", prop, "tooMutch"));
										}

										return;
									}

									if (!(prop in resultFields)) {
										resultFields[prop] = value;
									} else if (!(resultFields[prop] instanceof Array)) {
										resultFields[prop] = [resultFields[prop], value];
									} else if (resultFields[prop] instanceof Array) {
										resultFields[prop].push(value);
									}
								},
							);
						}

						busboyPipe.on("error", (error) => {
							busboyPipe.emit("close");
							errorCallback(error);
						});

						busboyPipe.on(
							"close",
							() => Promise
								.all(promiseList)
								.then(() => void resolve({
									...resultFields,
									...resultFiles,
								})),
						);

						request.raw.request.pipe(busboyPipe);
					} catch (error) {
						errorCallback(error);
					}
				},
			),
		);

		return true;
	};
}
