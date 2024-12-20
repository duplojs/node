import "@scripts/overrides/file";
import { createFakeRequest } from "@test/utils/request";
import { makeParsingBodyFormDataHook } from "./parsingBodyFormData";
import { type ReceiveFormData, ReceiveFormDataIssue, stringToBytes, File } from "@duplojs/core";
import FormData from "form-data";
import { ParsingBodyError } from "@scripts/error/parsingBodyError";
import { fs, fsp, fspSpy, fspSpyResetMock, fsSpy, fsSpyResetMock } from "@test/utils/fs";
import { BodySizeLimitError } from "@scripts/error/bodySizeLimitError";

describe("parsingBodyFormDataHook", () => {
	beforeEach(async() => {
		fsSpyResetMock();
		fspSpyResetMock();

		if (fs.existsSync("test/upload/parsingBodyFormDataHook")) {
			await fsp.rm("test/upload/parsingBodyFormDataHook", { recursive: true });
		}

		await fsp.mkdir("test/upload/parsingBodyFormDataHook");
	});

	afterAll(async() => {
		if (fs.existsSync("test/upload/parsingBodyFormDataHook")) {
			await fsp.rm("test/upload/parsingBodyFormDataHook", { recursive: true });
		}
	});

	it("not a form data", () => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 50000,
			recieveFormDataOptions: {
				strict: true,
				uploadDirectory: "test/upload/parsingBodyFormDataHook",
				prefixTempName: "tmp-",
			},
		} as any);

		const request = createFakeRequest();

		parsingBodyFormDataHook(request);

		expect(request.body).toBe(undefined);
	});

	it("body content length exceeds body sive limit", () => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 12,
			recieveFormDataOptions: {
				strict: true,
				uploadDirectory: "test/upload/parsingBodyFormDataHook",
				prefixTempName: "tmp-",
			},
		} as any);

		const request = createFakeRequest({
			headers: {
				"content-type": "multipart/form-data",
				"content-length": "20",
			},
		});

		expect(() => parsingBodyFormDataHook(request)).toThrowError(BodySizeLimitError);
	});

	it("busboy error", async() => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 50000,
			recieveFormDataOptions: {
				strict: true,
				uploadDirectory: "test/upload/parsingBodyFormDataHook",
				prefixTempName: "tmp-",
			},
		} as any);

		const request = createFakeRequest({
			headers: { "content-type": "multipart/form-data" },
		});

		parsingBodyFormDataHook(request);
		const receiveFormData = request.body as ReceiveFormData;

		await expect(() => receiveFormData.extractor({})).rejects.toThrowError(ParsingBodyError);
	});

	it("strict error field tooMutch", async() => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 50000,
			recieveFormDataOptions: {
				strict: true,
				uploadDirectory: "test/upload/parsingBodyFormDataHook",
				prefixTempName: "tmp-",
			},
		} as any);

		const formData = new FormData();
		formData.append("prop1", 123);

		const request = createFakeRequest({
			headers: formData.getHeaders(),
			raw: {
				request: {
					body: formData,
				},
			},
		});

		parsingBodyFormDataHook(request);
		const receiveFormData = request.body as ReceiveFormData;

		const result = await receiveFormData.extractor({ fields: [] });

		expect(result).instanceof(ReceiveFormDataIssue);
		expect(result.message).toBe("prop1 : field tooMutch");
	});

	it("get field", async() => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 50000,
			recieveFormDataOptions: {
				uploadDirectory: "test/upload/parsingBodyFormDataHook",
				prefixTempName: "tmp-",
				strict: false,
			},
		} as any);

		const formData = new FormData();
		formData.append("prop1", 123);

		const request = createFakeRequest({
			headers: formData.getHeaders(),
			raw: {
				request: {
					body: formData,
				},
			},
		});

		parsingBodyFormDataHook(request);
		const receiveFormData = request.body as ReceiveFormData;

		const result = await receiveFormData.extractor({ fields: ["prop1"] });

		expect(result).toStrictEqual({ prop1: "123" });
	});

	it("get array field", async() => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 50000,
			recieveFormDataOptions: {
				uploadDirectory: "test/upload/parsingBodyFormDataHook",
				prefixTempName: "tmp-",
				strict: false,
			},
		} as any);

		const formData = new FormData();
		formData.append("prop1", 123);
		formData.append("prop1", "toto");
		formData.append("prop1", "tata");

		const request = createFakeRequest({
			headers: formData.getHeaders(),
			raw: {
				request: {
					body: formData,
				},
			},
		});

		parsingBodyFormDataHook(request);
		const receiveFormData = request.body as ReceiveFormData;

		const result = await receiveFormData.extractor({ fields: ["prop1"] });

		expect(result).toStrictEqual({ prop1: ["123", "toto", "tata"] });
	});

	it("strict error files tooMutch", async() => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 50000,
			recieveFormDataOptions: {
				strict: true,
				uploadDirectory: "test/upload/parsingBodyFormDataHook",
				prefixTempName: "tmp-",
			},
		} as any);

		const formData = new FormData();
		formData.append("picture", fs.createReadStream("test/fakeFiles/1mb.png"));

		const request = createFakeRequest({
			headers: formData.getHeaders(),
			raw: {
				request: {
					body: formData,
				},
			},
		});

		parsingBodyFormDataHook(request);
		const receiveFormData = request.body as ReceiveFormData;

		const result = await receiveFormData.extractor({ files: {} });

		expect(result).instanceof(ReceiveFormDataIssue);
		expect(result.message).toBe("picture : file tooMutch");
	});

	it("strict error files qauntityExceeds", async() => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 50000,
			recieveFormDataOptions: {
				strict: true,
				uploadDirectory: "test/upload/parsingBodyFormDataHook",
				prefixTempName: "tmp-",
			},
		} as any);

		const formData = new FormData();
		formData.append("picture", fs.createReadStream("test/fakeFiles/1mb.png"));
		formData.append("picture", fs.createReadStream("test/fakeFiles/1mb.png"));

		const request = createFakeRequest({
			headers: formData.getHeaders(),
			raw: {
				request: {
					body: formData,
				},
			},
		});

		parsingBodyFormDataHook(request);
		const receiveFormData = request.body as ReceiveFormData;

		const result = await receiveFormData.extractor({
			files: {
				picture: {
					maxQuantity: 0,
					maxSize: stringToBytes("1.5mb"),
					mimeTypes: [/^image\/png$/],
				},
			},
		});

		expect(result).instanceof(ReceiveFormDataIssue);
		expect(result.message).toBe("picture : file qauntityExceeds");
	});

	it("error files wrongMimeType", async() => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 50000,
			recieveFormDataOptions: {
				strict: false,
				uploadDirectory: "test/upload/parsingBodyFormDataHook",
				prefixTempName: "tmp-",
			},
		} as any);

		const formData = new FormData();
		formData.append("picture", fs.createReadStream("test/fakeFiles/1mb.png"));

		const request = createFakeRequest({
			headers: formData.getHeaders(),
			raw: {
				request: {
					body: formData,
				},
			},
		});

		parsingBodyFormDataHook(request);
		const receiveFormData = request.body as ReceiveFormData;

		const result = await receiveFormData.extractor({
			files: {
				picture: {
					maxQuantity: 1,
					maxSize: stringToBytes("1.5mb"),
					mimeTypes: [/^image\/jpeg$/],
				},
			},
		});

		expect(result).instanceof(ReceiveFormDataIssue);
		expect(result.message).toBe("picture : file wrongMimeType");
	});

	it("error files sizeExceeds", async() => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 50000,
			recieveFormDataOptions: {
				strict: false,
				uploadDirectory: "test/upload/parsingBodyFormDataHook",
				prefixTempName: "tmp-",
			},
		} as any);

		const formData = new FormData();
		formData.append("picture", fs.createReadStream("test/fakeFiles/1mb.png"));

		const request = createFakeRequest({
			headers: formData.getHeaders(),
			raw: {
				request: {
					body: formData,
				},
			},
		});

		parsingBodyFormDataHook(request);
		const receiveFormData = request.body as ReceiveFormData;
		fsSpy.createWriteStream.mockImplementation(fs.createWriteStream);

		const result = await receiveFormData.extractor({
			files: {
				picture: {
					maxQuantity: 1,
					maxSize: stringToBytes("1mb") - 1,
					mimeTypes: [/^image\/png$/],
				},
			},
		});

		expect(result).instanceof(ReceiveFormDataIssue);
		expect(result.message).toBe("picture : file sizeExceeds");
		expect(request.attachedFilePaths?.length).toBe(1);
	});

	it("error files sizeExceeds multi file", async() => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 50000,
			recieveFormDataOptions: {
				strict: false,
				uploadDirectory: "test/upload/parsingBodyFormDataHook",
				prefixTempName: "tmp-",
			},
		} as any);

		const formData = new FormData();
		formData.append("picture", fs.createReadStream("test/fakeFiles/1mb.png"));
		formData.append("picture", fs.createReadStream("test/fakeFiles/2mb.png"));

		const request = createFakeRequest({
			headers: formData.getHeaders(),
			raw: {
				request: {
					body: formData,
				},
			},
		});

		parsingBodyFormDataHook(request);
		const receiveFormData = request.body as ReceiveFormData;
		fsSpy.createWriteStream.mockImplementation(fs.createWriteStream);

		const result = await receiveFormData.extractor({
			files: {
				picture: {
					maxQuantity: 2,
					maxSize: stringToBytes("1mb"),
					mimeTypes: [/^image\/png$/],
				},
			},
		});

		expect(result).instanceof(ReceiveFormDataIssue);
		expect(result.message).toBe("picture : file sizeExceeds");
		expect(request.attachedFilePaths?.length).toBe(2);
		expect(fs.lstatSync(request.attachedFilePaths?.at(0) ?? "").size).toBe(stringToBytes("1mb"));
		expect(fs.lstatSync(request.attachedFilePaths?.at(1) ?? "").size).toBe(1114112);
	});

	it("uplaod file", async() => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 50000,
			recieveFormDataOptions: {
				strict: false,
				uploadDirectory: "test/upload/parsingBodyFormDataHook",
				prefixTempName: "tmp-",
			},
		} as any);

		const formData = new FormData();
		formData.append("picture", fs.createReadStream("test/fakeFiles/1mb.png"));

		const request = createFakeRequest({
			headers: formData.getHeaders(),
			raw: {
				request: {
					body: formData,
				},
			},
		});

		parsingBodyFormDataHook(request);
		const receiveFormData = request.body as ReceiveFormData;
		fsSpy.createWriteStream.mockImplementation(fs.createWriteStream);

		const result = await receiveFormData.extractor({
			files: {
				picture: {
					maxQuantity: 2,
					maxSize: stringToBytes("1mb"),
					mimeTypes: [/^image\/png$/],
				},
			},
		}) as Record<string, File[]>;

		expect(request.attachedFilePaths?.length).toBe(1);
		expect(result.picture.at(0)).instanceOf(File);
		expect(fs.lstatSync(request.attachedFilePaths?.at(0) ?? "").size).toBe(stringToBytes("1mb"));
	});

	it("uplaod file in missing directory", async() => {
		const parsingBodyFormDataHook = makeParsingBodyFormDataHook({
			bodySizeLimit: 50000,
			recieveFormDataOptions: {
				strict: false,
				uploadDirectory: "test/upload/missingDirectory",
				prefixTempName: "tmp-",
			},
		} as any);

		const formData = new FormData();
		formData.append("picture", fs.createReadStream("test/fakeFiles/1mb.png"));

		const request = createFakeRequest({
			headers: formData.getHeaders(),
			raw: {
				request: {
					body: formData,
				},
			},
		});

		parsingBodyFormDataHook(request);
		const receiveFormData = request.body as ReceiveFormData;

		const result = receiveFormData.extractor({
			files: {
				picture: {
					maxQuantity: 1,
					maxSize: stringToBytes("1mb"),
					mimeTypes: [/^image\/png$/],
				},
			},
		});

		await expect(result).rejects.toThrowError(Error);
	});
});
