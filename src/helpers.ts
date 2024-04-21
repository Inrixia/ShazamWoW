import type { DecodedSignature } from "shazamio-core";
import type { ShazamData } from "./types/shazamTypes";
import { ISRCResponse } from "./types/isrcTypes";

const urlBase = process.env.NODE_ENV === "development" ? "http://127.0.0.1:8788" : "";

export const fetchShazamData = async (signature: { samplems: number; uri: string }) => {
	return parseResponse<ShazamData>(
		fetch(`${urlBase}/shazam`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ signature }),
		})
	);
};

export const fetchIsrc = async (isrc: string) => {
	return parseResponse<ISRCResponse>(fetch(`${urlBase}/isrc?isrc=${isrc}&countryCode=US`));
};

export const parseResponse = async <T>(responseP: Promise<Response> | Response) => {
	const response = await responseP;
	if (!response.ok) throw new Error(`Status ${response.status}`);
	return response.json<T>();
};

export const using = async <T>(signatures: DecodedSignature[], fun: (signatures: ReadonlyArray<DecodedSignature>) => T) => {
	const ret = await fun(signatures);
	for (const signature of signatures) signature.free();
	return ret;
};
