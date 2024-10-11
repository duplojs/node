import type { CurrentRequestObject } from "@duplojs/core";
import { existsSync } from "fs";
import { unlink } from "fs/promises";

export async function afterSendDeleteAttachedFilesHook(request: CurrentRequestObject) {
	if (request.attachedFilePaths) {
		await Promise.all(
			request.attachedFilePaths.map(
				(path) => existsSync(path) ? unlink(path) : undefined,
			),
		);
	}
}
