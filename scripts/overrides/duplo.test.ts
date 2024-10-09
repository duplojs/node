import { Duplo, useBuilder, Request, OkHttpResponse } from "@duplojs/core";
import httpMocks from "node-mocks-http";
import "./duplo";
import { Server as ServerHttp } from "http";
import { Server as ServerHttps } from "https";
import type { ExpectType } from "@tests/utils/expectType";

describe("duplo", () => {
	it("launch http", async() => {
		useBuilder()
			.createProcess("test")
			.exportation();

		const duplo = new Duplo({
			environment: "TEST",
			host: "localhost",
			port: 1506,
		});

		duplo.register(...useBuilder.getAllCreatedDuplose());

		const server = await duplo.launch();
		await new Promise<void>((res) => void server.close(() => void res()));

		type check = ExpectType<
			typeof server,
			ServerHttp,
			"strict"
		>;

		expect(server).instanceof(ServerHttp);
	});

	it("launch https", async() => {
		const duplo = new Duplo({
			environment: "TEST",
			host: "localhost",
			port: 1506,
			https: {},
		});

		const server = await duplo.launch();
		await new Promise<void>((res) => void server.close(() => void res()));

		type check = ExpectType<
			typeof server,
			ServerHttps,
			"strict"
		>;

		expect(server).instanceof(ServerHttps);
	});

	it("launch hook onStart", async() => {
		const duplo = new Duplo({
			environment: "TEST",
			host: "localhost",
			port: 1506,
		});

		const spyOnStart = vi.fn();
		const server = await duplo.launch(spyOnStart);
		await new Promise((res) => void setTimeout(res, 100));
		await new Promise<void>((res) => void server?.close(() => void res()));

		expect(spyOnStart).toBeCalledTimes(1);
	});

	it("launch server request", async() => {
		const duplo = new Duplo({
			environment: "TEST",
			host: "localhost",
			port: 1506,
		});

		const route = useBuilder()
			.createRoute("GET", "/")
			.handler(() => new OkHttpResponse("test"));

		duplo.register(route);

		const { req, res } = httpMocks.createMocks({ method: "GET" });

		const spyBeforeSend = vi.fn();
		const spySerializeBody = vi.fn();
		const spyAfterSend = vi.fn();

		duplo.hook("beforeSend", spyBeforeSend);
		duplo.hook("serializeBody", spySerializeBody);
		duplo.hook("afterSend", spyAfterSend);

		const server = await duplo.launch();
		await new Promise<void>((res) => void server?.close(() => void res()));

		server.emit("request", req, res);
		await new Promise((res) => void setTimeout(res, 100));

		expect(spyBeforeSend).toBeCalledTimes(1);
		expect(spySerializeBody).toBeCalledTimes(1);
		expect(spyAfterSend).toBeCalledTimes(1);
	});

	it("launch server request error", async() => {
		const duplo = new Duplo({
			environment: "TEST",
			host: "localhost",
			port: 1506,
		});

		const { req, res } = httpMocks.createMocks();

		const spy = vi.fn();

		duplo.hook("onHttpServerError", spy);

		const server = await duplo.launch();
		await new Promise<void>((res) => void server?.close(() => void res()));

		duplo.router!.find = vi.fn().mockImplementation(() => ({
			buildedRoute: () => {
				throw new Error();
			},
			matchedPath: null,
			params: {},
		}));

		server.emit("request", req, res);

		await new Promise((res) => void setTimeout(res, 100));

		expect(spy).toBeCalledTimes(1);
	});
});
