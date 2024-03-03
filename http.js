import { withCache } from "ultrafetch";

export const getRequestPayload = (req) => {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk.toString();
    });
    req.on("end", () => {
      resolve(data);
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
};

export const fetchWithCache = withCache(fetch);
