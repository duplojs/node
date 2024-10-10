import { Duplo, type GetPropsWithTrueValue, Request, Route, Router, useRouteBuilder, type DuploInputConfig } from "@duplojs/core";
import http from "http";
import https from "https";
import fastQueryString from "fast-querystring";
import { makeParsingBodyTextHook } from "@scripts/hooks/parsingBodyText";
import { makeParsingBodyFormDataHook } from "@scripts/hooks/parsingBodyFormData";
import { afterSendDeleteAttachedFilesHook } from "@scripts/hooks/afterSendDeleteAttachedFiles";
import { beforSendDefineContentTypeHook } from "@scripts/hooks/beforeSendDefineContentType";
import { serializeFileHook } from "@scripts/hooks/serializeFile";
import { serializeTextHook } from "@scripts/hooks/serializeText";
import { onErrorHook } from "@scripts/hooks/onError";

export interface Hosts {
	"::": true;
	"0.0.0.0": true;
	localhost: true;
	"127.0.0.1": true;
	"::1": true;
}

export type Host = GetPropsWithTrueValue<Hosts>;

declare module "@duplojs/core" {

	interface DuploConfig {
		port: number;
		host: Host;
		http?: http.ServerOptions;
		https?: https.ServerOptions;
	}

	interface Duplo<GenericDuploInputConfig extends DuploInputConfig> {
		router?: Router;
		launch(onStart?: (instance: Duplo) => void): Promise<
			unknown extends GenericDuploInputConfig["https"]
				? http.Server
				: https.Server
		>;
	}
}

Duplo.prototype.launch = async function(this: Duplo, onStart) {
	const notfoundHandler = this.notfoundHandler;
	const notfoundRoute = useRouteBuilder<Request>(new Route("GET", ["/*"])).handler((pickup, request) => notfoundHandler(request));
	notfoundRoute.instance = this;

	await this.hooksInstanceLifeCycle.beforeBuildRouter.launchSubscriberAsync(this);

	this.hooksRouteLifeCycle.parsingBody.addSubscriber(makeParsingBodyTextHook(this.config));
	this.hooksRouteLifeCycle.parsingBody.addSubscriber(makeParsingBodyFormDataHook(this.config));
	this.hooksRouteLifeCycle.onError.addSubscriber(onErrorHook);
	this.hooksRouteLifeCycle.beforeSend.addSubscriber(beforSendDefineContentTypeHook);
	this.hooksRouteLifeCycle.serializeBody.addSubscriber(serializeFileHook);
	this.hooksRouteLifeCycle.serializeBody.addSubscriber(serializeTextHook);
	this.hooksRouteLifeCycle.afterSend.addSubscriber(afterSendDeleteAttachedFilesHook);

	const router = new Router(
		this.duploses.filter((duplose) => duplose instanceof Route),
		notfoundRoute,
	);

	this.router = router;

	const server = this.config.https
		? https.createServer(this.config.https)
		: http.createServer(this.config.http ?? {});

	server.addListener(
		"request",
		async(serverRequest, serverResponse) => {
			const url = decodeURI(serverRequest.url ?? "");
			const method = serverRequest.method ?? "";

			const [unformatedPath = "/", queryString = ""] = url.split("?");
			const query = queryString ? fastQueryString.parse(queryString) : {};
			const path = unformatedPath.endsWith("/") ? (unformatedPath.slice(0, -1) || "/") : unformatedPath;

			const { buildedRoute, matchedPath, params } = router.find(method, path);

			const request = new Request({
				method,
				matchedPath,
				path,
				params,
				headers: serverRequest.headers,
				host: serverRequest.headers.host ?? "",
				origin: serverRequest.headers.origin ?? "",
				url,
				query,
				raw: {
					request: serverRequest,
					response: serverResponse,
				},
			});

			try {
				const response = await buildedRoute(request);

				await buildedRoute.context.hooks.beforeSend(request, response);

				serverResponse.writeHead(
					response.code,
					response.headers,
				);

				await buildedRoute.context.hooks.serializeBody(request, response);

				serverResponse.end();

				await buildedRoute.context.hooks.afterSend(request, response);
			} catch (error) {
				await this.hooksInstanceLifeCycle.onHttpServerError.launchSubscriberAsync(request, error);

				if (!serverResponse.headersSent && !serverResponse.writableEnded) {
					serverResponse.writeHead(500, {});

					serverResponse.write(error?.toString?.() ?? "UNKNOWN_SERVER_ERROR");
				}

				if (!serverResponse.writableEnded) {
					serverResponse.end();
				}
			}
		},
	);

	if (onStart) {
		this.hooksInstanceLifeCycle.onStart.addSubscriber(
			onStart,
		);
	}

	server.addListener("listening", () => this.hooksInstanceLifeCycle.onStart.launchSubscriberAsync(this));

	server.listen(this.config.port, this.config.host);

	return server;
};
