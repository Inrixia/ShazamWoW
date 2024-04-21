interface Env {
	TIDAL_CLIENT_ID: string;
	TIDAL_CLIENT_SECRET: string;
	stash: KVNamespace;
}

type TokenInfo = {
	scope: string;
	token_type: string;
	access_token: string;
	expires_in: number;
};

export const onRequest: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
	if (request.method !== "GET") return new Response("", { status: 405 });

	let token = await env.stash.get("TIDAL_TOKEN", "text");
	if (token === null) {
		const result = await fetch("https://auth.tidal.com/v1/oauth2/token", {
			method: "POST",
			body: new URLSearchParams({
				grant_type: "client_credentials",
			}),
			headers: {
				Authorization: `Basic ${btoa(`${env.TIDAL_CLIENT_ID}:${env.TIDAL_CLIENT_SECRET}`)}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			redirect: "follow",
		});
		const { access_token, expires_in } = await result.json<TokenInfo>();
		token = access_token;
		waitUntil(env.stash.put("TIDAL_TOKEN", access_token, { expirationTtl: expires_in }));
	}

	const url = new URL(request.url);
	const isrcUrl = new URL(`https://openapi.tidal.com/tracks/byIsrc`);
	for (const [key, value] of url.searchParams.entries()) isrcUrl.searchParams.append(key, value);

	console.log(isrcUrl);

	return fetch(isrcUrl, {
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/vnd.tidal.v1+json",
		},
		redirect: "follow",
	});
};
