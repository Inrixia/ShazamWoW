import React, { useMemo, CSSProperties } from "react";
import { useDropzone } from "react-dropzone";
import initShazamio, { DecodedSignature, recognizeBytes } from "shazamio-core/web";
import { ShazamData } from "./shazamTypes";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { fetchShazamData, using } from "./helpers";

const boxStyle: CSSProperties = {
	borderRadius: 12,
	boxShadow: "0px 0px 20px 0px inset rgba(0, 0, 0, 0.8), 0px 0px 20px 0px rgba(0, 0, 0, 0.8)",
	color: "#black",
	outline: "none",
};
const baseStyle: CSSProperties = {
	borderColor: "white",
	borderWidth: "1px !important",
	borderStyle: "solid",
	backgroundColor: "#282c34",
	color: "#black",
	transition: "border .2s ease-in-out",
	...boxStyle,
};

const acceptStyle: CSSProperties = {
	borderColor: "#00e676",
};
const rejectStyle: CSSProperties = {
	borderColor: "#ff1744",
};

const initShazamioPromise = initShazamio();
type ShazamError = {
	file: File;
	error: Error;
	shazamData?: undefined;
};
type ShazamSuccess = {
	file: File;
	error?: undefined;
	shazamData: ShazamData;
};
type Shazam = ShazamError | ShazamSuccess;

const InvisibleDropzone = () => {
	const [shazams, setShazams] = React.useState<Shazam[]>([]);
	const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
		accept: { "audio/*": [] },
		// disabled: shazams.length > 0,
		onDropAccepted: async (files) => {
			await initShazamioPromise;
			const newShazams = await Promise.all(
				files.map(async (file) => {
					try {
						return using(recognizeBytes(new Uint8Array(await file.arrayBuffer()), 0, Number.MAX_SAFE_INTEGER), async (signatures) => {
							console.log(`${signatures.length} signatures found for ${file.name}`);
							for (let i = 0; i < signatures.length; i += 2) {
								const signature = signatures[i];
								const shazamData = await fetchShazamData({ samplems: signature.samplems, uri: signature.uri });
								console.log(`Sig ${i} - ${file.name}`, shazamData, signature);
								if (shazamData.matches.length > 0) return { file, shazamData };
							}
							throw new Error("No matches found");
						});
					} catch (error) {
						console.error(error);
						return { file, error: error as Error };
					}
				})
			);
			setShazams((previousShazams) => [...previousShazams, ...newShazams]);
		},
	});

	const style = useMemo(
		() => ({
			...baseStyle,
			...(isFocused ? acceptStyle : {}),
			...(isDragAccept ? acceptStyle : {}),
			...(isDragReject ? rejectStyle : {}),
		}),
		[isFocused, isDragAccept, isDragReject]
	);

	return (
		<Grid container spacing={1} style={{ padding: 20 }}>
			<div {...getRootProps({ style: { ...style, width: "100%" } })}>
				<Grid item xs={12} style={{ textAlign: "center", padding: 32 }}>
					<input {...getInputProps()} />
					<Typography
						variant="h2"
						style={{
							zIndex: -1,
							color: "white",
						}}
					>
						Upload Files
					</Typography>
					<Typography
						variant="subtitle1"
						style={{
							zIndex: -1,
							color: "white",
						}}
					>
						Click anywhere or drop audio files here to shazam them!
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Grid container spacing={2} style={{ padding: 16 }}>
						{shazams.map(({ shazamData, error, file }, key) => {
							if (error) return <h1 style={{ color: "red" }}>{error.message}</h1>;
							if (shazamData?.track?.albumadamid === undefined) return null;
							return (
								<Grid item key={key} xs={4}>
									<iframe
										title={file.name}
										allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
										frameBorder=""
										height={450}
										style={{ width: "100%", maxWidth: "660px", overflow: "hidden", borderRadius: 10 }}
										sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
										src={`https://embed.music.apple.com/us/album/${shazamData?.track.albumadamid}`}
									/>
								</Grid>
							);
						})}
					</Grid>
				</Grid>
			</div>
		</Grid>
	);
};

export default InvisibleDropzone;
