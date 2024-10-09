import { fsSpy, fspSpy } from "@tests/utils/fs";
import { afterSendDeleteAttachedFiles } from "./afterSendDeleteAttachedFiles";
import { createFakeRequest } from "@tests/utils/request";

describe("afterSendDeleteAttachedFiles", () => {
	it("delete attached file", async() => {
		const request = createFakeRequest();

		request.attachedFilePaths = ["toto.png", "tata.txt"];

		fsSpy.existsSync.mockImplementation(() => true);

		await afterSendDeleteAttachedFiles(request);

		expect(fsSpy.existsSync).toHaveBeenNthCalledWith(1, "toto.png");
		expect(fspSpy.unlink).toHaveBeenNthCalledWith(1, "toto.png");

		expect(fsSpy.existsSync).toHaveBeenNthCalledWith(2, "tata.txt");
		expect(fspSpy.unlink).toHaveBeenNthCalledWith(2, "tata.txt");
	});
});
