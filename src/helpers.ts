import type { DecodedSignature } from "shazamio-core";
import type { ShazamData } from "./shazamTypes";

export const fetchShazamData = async (signature: { samplems: number; uri: string }) => {
	const response = await fetch("http://shazamwow.com/shazam", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ signature }),
	});
	if (!response.ok) throw new Error("Network response was not ok");
	return response.json<ShazamData>();
};

export const using = async <T>(signatures: DecodedSignature[], fun: (signatures: ReadonlyArray<DecodedSignature>) => T) => {
	const ret = await fun(signatures);
	for (const signature of signatures) signature.free();
	return ret;
};
