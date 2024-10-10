import { fsSpy, fspSpy } from "@test/utils/fs";
import { afterSendDeleteAttachedFilesHook } from "./afterSendDeleteAttachedFiles";
import { createFakeRequest } from "@test/utils/request";

describe("afterSendDeleteAttachedFiles", () => {
	it("delete attached file", async() => {
		const request = createFakeRequest();

		request.attachedFilePaths = ["toto.png", "tata.txt"];

		fsSpy.existsSync.mockImplementation(() => true);

		await afterSendDeleteAttachedFilesHook(request);

		expect(fsSpy.existsSync).toHaveBeenNthCalledWith(1, "toto.png");
		expect(fspSpy.unlink).toHaveBeenNthCalledWith(1, "toto.png");

		expect(fsSpy.existsSync).toHaveBeenNthCalledWith(2, "tata.txt");
		expect(fspSpy.unlink).toHaveBeenNthCalledWith(2, "tata.txt");
	});
});
