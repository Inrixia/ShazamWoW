export const onRequest: PagesFunction = async ({ request, next }) => {
	if (request.method === "OPTIONS") {
		return new Response(null, {
			status: 204,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		});
	}
	const response = await next();
	response.headers.set("Access-Control-Allow-Origin", "*");
	response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
	response.headers.set("Access-Control-Allow-Headers", "Content-Type");
	return response;
};
