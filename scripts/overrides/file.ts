import { File } from "@duplojs/core";
import { access, rename, unlink } from "fs/promises";

File.delete = function(path) {
	return unlink(path);
};

File.move = function(path, newPath) {
	return rename(path, newPath);
};

File.rename = function(path, newPath) {
	return rename(path, newPath);
};

File.deplace = function(path, newPath) {
	return rename(path, newPath);
};

File.exist = function(path) {
	return access(path)
		.then(() => true)
		.catch(() => false);
};
