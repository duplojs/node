import { File } from "@duplojs/core";
import { rename, unlink } from "fs/promises";
import { dirname, resolve } from "path";

declare module "@duplojs/core" {
	interface File {
		rename(newName: string): Promise<void>;
		move(newBasePath: string): Promise<void>;
		deplace(newPath: string): Promise<void>;
		delete(): Promise<void>;
	}
}

File.prototype.delete = function() {
	return unlink(this.path);
};

File.prototype.move = function(newBasePath) {
	const { name } = this.informations;
	const newPath = resolve(newBasePath, name);

	return rename(this.path, newPath)
		.then(() => void (this.path = newPath));
};

File.prototype.rename = function(newName) {
	const directory = dirname(this.path);
	const newPath = resolve(directory, newName);

	return rename(this.path, newPath)
		.then(() => {
			const { informations } = new File(newPath);
			this.informations = informations;
		});
};

File.prototype.deplace = function(newPath) {
	return rename(this.path, newPath)
		.then(() => {
			const { informations } = new File(newPath);
			this.informations = informations;
		});
};
