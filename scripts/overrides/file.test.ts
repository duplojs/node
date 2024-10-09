import { fspSpy, fspSpyResetMock } from "@tests/utils/fs";
import "./file";
import { File } from "@duplojs/core";

describe("file", () => {
	beforeEach(() => {
		fspSpyResetMock();
	});

	it("delete", async() => {
		const file = new File("toto.png");

		fspSpy.unlink.mockResolvedValue(undefined);

		await file.delete();

		expect(fspSpy.unlink).toBeCalledWith("toto.png");
	});

	it("deplace", async() => {
		const file = new File("toto.png");

		fspSpy.rename.mockResolvedValue(undefined);

		await file.deplace("toto/tata.png");

		expect(fspSpy.rename).toBeCalledWith("toto.png", "toto/tata.png");
	});

	it("move", async() => {
		const file = new File("/lulu/toto.png");

		fspSpy.rename.mockResolvedValue(undefined);

		await file.move("/lala");

		expect(fspSpy.rename).toBeCalledWith("/lulu/toto.png", "/lala/toto.png");
	});

	it("move", async() => {
		const file = new File("/ioi/toto.png");

		fspSpy.rename.mockResolvedValue(undefined);

		await file.rename("tutu.png");

		expect(fspSpy.rename).toBeCalledWith("/ioi/toto.png", "/ioi/tutu.png");
	});
});
