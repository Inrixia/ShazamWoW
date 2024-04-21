import { v4 } from "uuid";

export const onRequest: PagesFunction = async ({ request, next }) => {
	if (request.method !== "POST") return new Response("", { status: 405 });
	const corsRequest = new Request(
		`https://amp.shazam.com/discovery/v5/en-US/US/iphone/-/tag/${v4()}/${v4()}?sync=true&webv3=true&sampling=true&connected=&shazamapiversion=v3&sharehub=true&hubv5minorversion=v5.1&hidelb=true&video=v3`,
		{
			headers: request.headers,
			method: request.method,
			body: request.body,
			redirect: "follow",
		}
	);
	const corsResponse = await fetch(corsRequest);
	return new Response(corsResponse.body, corsResponse);
};
