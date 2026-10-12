import JSZip from "jszip";
import { bundleMedia, loadExportSite, slugify, type ExportProgress } from "./export-content.ts";
import { buildReactProject } from "./react-export.ts";
import { buildStaticSite } from "./static-export.tsx";

export type ExportFormat = "html" | "react";

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Builds the website's code in the browser and downloads it as a zip. */
export async function exportWebsite(websiteId: string, format: ExportFormat, onProgress: ExportProgress): Promise<void> {
  onProgress("Loading website");
  const loaded = await loadExportSite(websiteId);
  const isHtml = format === "html";
  const { site, files: media } = await bundleMedia(
    loaded,
    (fileName) => (isHtml ? `assets/media/${fileName}` : `/media/${fileName}`),
    isHtml ? "assets/media" : "public/media",
    onProgress,
  );
  const files = isHtml ? await buildStaticSite(site, onProgress) : await buildReactProject(site, onProgress);

  onProgress("Creating zip");
  const folderName = `${slugify(site.name)}-${isHtml ? "html" : "react"}`;
  const zip = new JSZip();
  const root = zip.folder(folderName) ?? zip;
  for (const file of [...files, ...media]) root.file(file.path, file.data);
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  saveBlob(blob, `${folderName}.zip`);
}
