import { createRequestHandler } from "@tanstack/react-start/server";
import { getRouterManifest } from "@tanstack/react-start/router-manifest";

const manifest = getRouterManifest();
const requestHandler = createRequestHandler({ manifest });

export default {
  fetch: requestHandler,
};
