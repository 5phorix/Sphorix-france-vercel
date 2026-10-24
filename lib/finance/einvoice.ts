export type ElectronicInvoiceLine = {
  label: string;
  amountHT: number;
  taxRate: number;
};

export type ElectronicInvoice = {
  number: string;
  date: string;
  dueDate: string;
  supplierName: string;
  supplierId: string;
  totalTTC?: number;
  lines: ElectronicInvoiceLine[];
  sourceFormat?: "UBL" | "CII" | "Factur-X PDF" | "PDF/OCR" | "Image/OCR";
  warnings?: string[];
};

type XmlNode = Element | Document;

function children(node: XmlNode, name: string): Element[] {
  return Array.from(node.children).filter((child) => child.localName === name);
}

function firstChild(node: XmlNode, name: string): Element | undefined {
  return children(node, name)[0];
}

function firstDescendant(node: XmlNode, name: string): Element | undefined {
  return Array.from(node.getElementsByTagName("*")).find((element) => element.localName === name);
}

function path(node: XmlNode, names: string[]): Element | undefined {
  return names.reduce<Element | undefined>((current, name) => current && firstChild(current, name), node as Element | undefined);
}

function value(node: XmlNode | undefined): string {
  return node?.textContent?.trim() ?? "";
}

function parseCents(raw: string, label: string): number {
  const normalized = raw.trim().replace(/\s/g, "").replace(",", ".");
  const amount = Number(normalized);
  if (!normalized || !Number.isFinite(amount) || amount < 0) throw new Error(`${label} est absent ou invalide.`);
  return Math.round(amount * 100);
}

function parseDate(raw: string, label: string): string {
  const normalized = raw.trim();
  const date = /^\d{8}$/.test(normalized)
    ? `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}`
    : normalized;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00`))) {
    throw new Error(`${label} est absente ou invalide.`);
  }
  return date;
}

function required(valueToCheck: string, label: string): string {
  if (!valueToCheck) throw new Error(`${label} est absent du fichier.`);
  return valueToCheck;
}

function parseUbl(root: Element): ElectronicInvoice {
  const number = required(value(path(root, ["ID"])), "Le numéro de facture");
  const date = parseDate(value(path(root, ["IssueDate"])), "La date de facture");
  const supplier = path(root, ["AccountingSupplierParty", "Party"]);
  const supplierName = required(
    value(path(supplier ?? root, ["PartyLegalEntity", "RegistrationName"])) ||
      value(path(supplier ?? root, ["PartyName", "Name"])),
    "Le nom du fournisseur",
  );
  const supplierId =
    value(path(supplier ?? root, ["PartyTaxScheme", "CompanyID"])) ||
    value(path(supplier ?? root, ["PartyIdentification", "ID"])) ||
    supplierName;
  const dueDateRaw = value(path(root, ["DueDate"]));
  const lines = children(root, "InvoiceLine").map((line, index) => ({
    label: value(path(line, ["Item", "Name"])) || `Ligne ${index + 1}`,
    amountHT: parseCents(value(path(line, ["LineExtensionAmount"])), `Le montant HT de la ligne ${index + 1}`),
    taxRate: Number(value(path(line, ["Item", "ClassifiedTaxCategory", "Percent"]))),
  }));

  return {
    number,
    date,
    dueDate: dueDateRaw ? parseDate(dueDateRaw, "La date d’échéance") : date,
    supplierName,
    supplierId,
    totalTTC: optionalAmount(path(root, ["LegalMonetaryTotal", "PayableAmount"]) ?? path(root, ["LegalMonetaryTotal", "TaxInclusiveAmount"])),
    lines: validateLines(lines),
    sourceFormat: "UBL",
  };
}

function parseCii(root: Element): ElectronicInvoice {
  const document = firstChild(root, "ExchangedDocument");
  const transaction = firstChild(root, "SupplyChainTradeTransaction");
  const agreement = firstChild(transaction ?? root, "ApplicableHeaderTradeAgreement");
  const settlement = firstChild(transaction ?? root, "ApplicableHeaderTradeSettlement");
  const seller = firstChild(agreement ?? root, "SellerTradeParty");
  const number = required(value(path(document ?? root, ["ID"])), "Le numéro de facture");
  const issueDate = firstDescendant(firstChild(root, "ExchangedDocument") ?? root, "DateTimeString");
  const date = parseDate(value(issueDate), "La date de facture");
  const supplierName = required(
    value(path(seller ?? root, ["Name"])) || value(path(firstChild(seller ?? root, "SpecifiedLegalOrganization") ?? root, ["TradingBusinessName"])),
    "Le nom du fournisseur",
  );
  const supplierId = value(path(seller ?? root, ["ID"])) || supplierName;
  const items = children(transaction ?? root, "IncludedSupplyChainTradeLineItem");
  const lines = items.map((line, index) => {
    const amount = path(line, ["SpecifiedLineTradeSettlement", "SpecifiedTradeSettlementLineMonetarySummation", "LineTotalAmount"]);
    const rate = path(line, ["SpecifiedLineTradeSettlement", "ApplicableTradeTax", "RateApplicablePercent"]);
    return {
      label: value(path(line, ["SpecifiedTradeProduct", "Name"])) || `Ligne ${index + 1}`,
      amountHT: parseCents(value(amount), `Le montant HT de la ligne ${index + 1}`),
      taxRate: Number(value(rate)),
    };
  });
  const dueDateRaw = value(path(settlement ?? root, ["SpecifiedTradePaymentTerms", "DueDateDateTime", "DateTimeString"]));
  const total =
    path(settlement ?? root, ["SpecifiedTradeSettlementHeaderMonetarySummation", "DuePayableAmount"]) ??
    path(settlement ?? root, ["SpecifiedTradeSettlementHeaderMonetarySummation", "GrandTotalAmount"]);

  return {
    number,
    date,
    dueDate: dueDateRaw ? parseDate(dueDateRaw, "La date d’échéance") : date,
    supplierName,
    supplierId,
    totalTTC: optionalAmount(total),
    lines: validateLines(lines),
    sourceFormat: "CII",
  };
}

function optionalAmount(node: Element | undefined): number | undefined {
  const raw = value(node);
  return raw ? parseCents(raw, "Le total TTC") : undefined;
}

function validateLines(lines: ElectronicInvoiceLine[]): ElectronicInvoiceLine[] {
  if (lines.length === 0) throw new Error("Aucune ligne de facture n’a été trouvée.");
  for (const [index, line] of lines.entries()) {
    if (!Number.isFinite(line.taxRate) || line.taxRate < 0 || line.taxRate > 100) {
      throw new Error(`Le taux de TVA de la ligne ${index + 1} est absent ou invalide.`);
    }
  }
  return lines;
}

export function parseElectronicInvoiceXml(xml: string): ElectronicInvoice {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (document.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Le fichier XML est mal formé.");
  }

  const root = document.documentElement;
  if (root.localName === "Invoice") return parseUbl(root);
  if (root.localName === "CrossIndustryInvoice") return parseCii(root);
  throw new Error("Format non reconnu. Importez une facture électronique XML UBL ou CII.");
}

function parseOcrAmount(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const compact = text.replace(/[\s\u00a0]/g, "");
  const comma = compact.lastIndexOf(",");
  const dot = compact.lastIndexOf(".");
  let normalized = compact;
  if (comma >= 0 && dot >= 0) {
    normalized = comma > dot ? compact.replace(/\./g, "").replace(",", ".") : compact.replace(/,/g, "");
  } else if (comma >= 0) {
    normalized = compact.slice(comma + 1).length === 2 ? compact.replace(",", ".") : compact.replace(/,/g, "");
  } else if (dot >= 0 && compact.slice(dot + 1).length === 3) {
    normalized = compact.replace(/\./g, "");
  }
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : undefined;
}

function dateFromOcr(text: string | undefined): string {
  if (!text) return "";
  const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  let date = "";
  if (match) {
    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
    date = `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    date = text;
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  return date && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date ? date : "";
}

function amountAfterLabel(text: string, label: RegExp): number | undefined {
  const line = text.split(/\r?\n/).find((item) => label.test(item));
  if (!line) return undefined;
  const labelMatch = line.match(label);
  const amountText = line.slice((labelMatch?.index ?? 0) + (labelMatch?.[0].length ?? 0));
  const amount = amountText.match(/-?\d[\d\s\u00a0.,]*\d|-?\d/);
  return parseOcrAmount(amount?.[0]);
}

export function parseOcrInvoiceText(text: string, sourceFormat: "PDF/OCR" | "Image/OCR"): ElectronicInvoice {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const invoiceNumber = normalizedText.match(/(?:n[°ºo]\s*(?:de\s*)?facture|facture\s*(?:n[°ºo]|numero|#)|invoice\s*(?:no\.?|number|#))\s*[:#-]?\s*([A-Z0-9][A-Z0-9/._-]{2,})/i)?.[1] ?? "";
  const invoiceDate = normalizedText.match(/(?:date\s*(?:de\s*)?facture|invoice\s*date|emise\s*le)\s*[:#-]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}-\d{2}-\d{2})/i)?.[1];
  const dueDate = normalizedText.match(/(?:date\s*d['’]?echeance|echeance|due\s*date)\s*[:#-]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}-\d{2}-\d{2})/i)?.[1];
  const rateMatch = normalizedText.match(/(?:TVA|VAT)\s*(?:a|at)?\s*(\d{1,2}(?:[,.]\d+)?)\s*%/i);
  const rate = rateMatch ? Number(rateMatch[1].replace(",", ".")) : Number.NaN;
  const totalHT = amountAfterLabel(normalizedText, /(?:total\s*(?:hors\s*taxes?|HT)|montant\s*(?:hors\s*taxes?|HT)|net\s*hors\s*taxes?)\b/i);
  const totalTTC = amountAfterLabel(normalizedText, /(?:total\s*(?:TTC|toutes\s*taxes\s*comprises)|net\s*a\s*payer|montant\s*du)\b/i);
  const effectiveRate = Number.isFinite(rate) ? rate : totalHT && totalTTC
    ? Math.round(((totalTTC / totalHT - 1) * 100) * 100) / 100
    : Number.NaN;
  const amountHT = totalHT ?? (totalTTC !== undefined && Number.isFinite(effectiveRate)
    ? Math.round(totalTTC / (1 + effectiveRate / 100))
    : 0);
  const supplierId = text.match(/\bFR[A-Z0-9]{11}\b/i)?.[0] ?? "";
  const supplierName = lines.find((line) => line.length > 2 && line.length < 100 && !/document|scann?é?|facture|invoice|date|tva|total/i.test(line)) ?? "";

  return {
    number: invoiceNumber,
    date: dateFromOcr(invoiceDate),
    dueDate: dateFromOcr(dueDate) || dateFromOcr(invoiceDate),
    supplierName,
    supplierId,
    totalTTC,
    lines: [{
      label: "",
      amountHT,
      taxRate: effectiveRate,
    }],
    sourceFormat,
  };
}

export async function extractInvoiceFromFile(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<ElectronicInvoice> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  let worker: Awaited<ReturnType<(typeof import("tesseract.js"))["createWorker"]>> | undefined;
  const recognize = async (image: HTMLCanvasElement | File) => {
    if (!worker) {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker("fra+eng", 1, {
        logger: (message) => {
          if (message.status === "recognizing text") onProgress?.(message.progress);
        },
      });
    }
    const result = await worker.recognize(image);
    return result.data.text;
  };

  try {
    if (!isPdf) {
      return parseOcrInvoiceText(await recognize(file), "Image/OCR");
    }

    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    try {
      const attachments: unknown = await pdf.getAttachments();
      if (attachments && typeof attachments === "object") {
        for (const attachment of Object.values(attachments)) {
          if (!attachment || typeof attachment !== "object") continue;
          const candidate = attachment as { filename?: unknown; content?: unknown };
          if (
            typeof candidate.filename === "string"
            && /factur[-_ ]?x|zugferd|invoice.*\.xml/i.test(candidate.filename)
            && candidate.content instanceof Uint8Array
          ) {
            const invoice = parseElectronicInvoiceXml(new TextDecoder().decode(candidate.content));
            return { ...invoice, sourceFormat: "Factur-X PDF" };
          }
        }
      }

      const pageTexts: string[] = [];
      const pageCount = Math.min(pdf.numPages, 10);
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        onProgress?.((pageNumber - 1) / pageCount);
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
        if (pageText.replace(/\s/g, "").length >= 40) {
          pageTexts.push(pageText);
          continue;
        }

        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Impossible de préparer la page PDF pour l’OCR.");
        await page.render({ canvasContext: context, viewport }).promise;
        pageTexts.push(await recognize(canvas));
      }
      if (pageTexts.join("\n").trim().length < 10) {
        throw new Error("Aucun texte exploitable n’a été extrait du document.");
      }
      const invoice = parseOcrInvoiceText(pageTexts.join("\n"), "PDF/OCR");
      if (pdf.numPages > pageCount) invoice.warnings = ["Seules les 10 premières pages du PDF ont été analysées."];
      return invoice;
    } finally {
      await pdf.destroy();
    }
  } finally {
    await worker?.terminate();
  }
}
