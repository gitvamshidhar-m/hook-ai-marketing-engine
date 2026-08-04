import { ANGLE_CATEGORIES } from "./types";
import type { AnalyzeResult } from "./types";
import { classifyHook } from "./psych";

export type Coverage = {
  total: number;
  covered: number;
  perAngle: Record<string, number>;
  globalCovered: string[];
  competitorIds: string[];
};

export function computeCoverage(result: AnalyzeResult): Coverage {
  const perAngle: Record<string, number> = {};
  ANGLE_CATEGORIES.forEach((c) => (perAngle[c.id] = 0));
  result.hooks.forEach((h) => {
    const id = classifyHook(h.text);
    if (id in perAngle) perAngle[id] += 1;
  });
  const coveredIds = ANGLE_CATEGORIES.map((c) => c.id).filter((id) => perAngle[id] > 0);
  const competitorIds: string[] = [];
  result.competitorHooks.forEach((c) => {
    const id = classifyHook(c);
    if (!competitorIds.includes(id)) competitorIds.push(id);
  });
  return {
    total: ANGLE_CATEGORIES.length,
    covered: coveredIds.length,
    perAngle,
    globalCovered: coveredIds,
    competitorIds,
  };
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function buildShareUrl(result: AnalyzeResult): Promise<string> {
  const json = JSON.stringify(result);
  let payload = "";
  if (typeof CompressionStream !== "undefined") {
    const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"));
    const buf = await new Response(stream).arrayBuffer();
    payload = bytesToBase64(new Uint8Array(buf));
  } else {
    payload = btoa(encodeURIComponent(json));
  }
  return `${window.location.origin}/r?d=${payload}`;
}

export async function decodeShareData(query: string | null): Promise<AnalyzeResult | null> {
  if (!query) return null;
  try {
    let json: string;
    const bytes = base64ToBytes(query);
    // gzip magic bytes 1f 8b
    if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
      const buf = await new Response(stream).arrayBuffer();
      json = new TextDecoder().decode(buf);
    } else {
      json = decodeURIComponent(atob(query));
    }
    const obj = JSON.parse(json);
    if (obj && Array.isArray(obj.hooks)) return obj as AnalyzeResult;
    return null;
  } catch {
    return null;
  }
}