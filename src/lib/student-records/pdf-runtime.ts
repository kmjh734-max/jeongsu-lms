import "pdf-parse/worker";
import { CanvasFactory, getPath } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

PDFParse.setWorker(getPath());

export function createPdfParser(buffer: Buffer): PDFParse {
  return new PDFParse({ data: buffer, CanvasFactory });
}
