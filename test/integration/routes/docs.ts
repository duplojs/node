import { NoContentHttpResponse, recieveFiles, useBuilder, zod } from "@duplojs/core";

useBuilder()
	.createRoute("POST", "/docs")
	.extract({
		body: zod.receiveFormData({
			docs: recieveFiles({
				quantity: [1, 2],
				maxSize: "1mb",
				mimeType: "image/png",
			}),
			accepte: zod.booleanInString(),
		}),
	})
	.handler(async(pickup) => {
		const { docs, accepte } = pickup("body");

		if (accepte) {
			await docs.at(0)!.deplace("savedFile/toto.png");
		}

		return new NoContentHttpResponse("uploadedFile");
	});
