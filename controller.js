import { getRequestPayload } from "./http.js";
import { PDF } from "./pdf.js";

export default async ({ req, res }) => {
  const requestJson = await getRequestPayload(req);

  const pdf = new PDF();
  await pdf.addImages(JSON.parse(requestJson));
  const content = await pdf.read();

  res.setHeader("Content-Type", "application/pdf");
  res.end(content);
};
