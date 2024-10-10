import { fs, fsSpy, fsSpyResetMock } from "@test/utils/fs";
import { createFakeRequest } from "@test/utils/request";
import { serializeFileHook } from "./serializeFile";
import { Response, File } from "@duplojs/core";
import { EventEmitter } from "stream";

describe("serializeFile", () => {
	beforeEach(() => {
		fsSpyResetMock();
	});

	it("body is not file", async() => {
		const request = createFakeRequest();

		await serializeFileHook(request, new Response(200, "toto", ""));

		expect(fsSpy.createReadStream).toHaveBeenCalledTimes(0);
	});

	it("body is not file", async() => {
		const request = createFakeRequest({
			raw: {
				response: {
					eventEmitter: EventEmitter,
				},
			},
		});

		fsSpy.createReadStream.mockImplementation(() => ({
			pipe: (arg: any) => {
				expect(arg).toBe(request.raw.response);
			},
		}));

		setTimeout(() => {
			request.raw.response.emit("close");
		});

		await serializeFileHook(request, new Response(200, "toto", new File("toto.png")));

		expect(fsSpy.createReadStream).toBeCalledWith("toto.png");
	});
});
