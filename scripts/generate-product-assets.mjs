import ExcelJS from "exceljs";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const productsDir = path.join(root, "content", "products");
const visualsDir = path.join(root, "content", "visuals");
const publicVisualsDir = path.join(root, "public", "products");
mkdirSync(productsDir, { recursive: true });
mkdirSync(visualsDir, { recursive: true });
mkdirSync(publicVisualsDir, { recursive: true });

const colors = {
  navy: "0F172A",
  blue: "1D4ED8",
  orange: "F97316",
  pale: "FFF7ED",
  ink: "1E293B",
  muted: "64748B",
  white: "FFFFFF",
  green: "15803D",
};

function styleTitle(cell, color = colors.navy) {
  cell.font = { name: "Aptos Display", size: 20, bold: true, color: { argb: `FF${colors.white}` } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${color}` } };
  cell.alignment = { vertical: "middle" };
}

function styleHeader(row, color = colors.blue) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: `FF${colors.white}` } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${color}` } };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
}

function styleSheet(sheet) {
  sheet.views = [{ state: "frozen", ySplit: 4 }];
  sheet.properties.defaultRowHeight = 20;
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
      };
      cell.alignment = { ...cell.alignment, vertical: "center" };
    });
  });
}

function addIntro(workbook, title, purpose, note) {
  const sheet = workbook.addWorksheet("Mode d'emploi");
  sheet.mergeCells("A1:F1");
  sheet.getCell("A1").value = `SPHORIX FRANCE  |  ${title}`;
  styleTitle(sheet.getCell("A1"), colors.navy);
  sheet.getRow(1).height = 34;
  sheet.mergeCells("A3:F3");
  sheet.getCell("A3").value = purpose;
  sheet.getCell("A3").font = { size: 14, bold: true, color: { argb: `FF${colors.ink}` } };
  sheet.mergeCells("A5:F7");
  sheet.getCell("A5").value = `MODELE AVEC DONNEES FICTIVES\n${note}\nVersion 1.0 - Septembre 2026`;
  sheet.getCell("A5").alignment = { wrapText: true, vertical: "top" };
  sheet.getCell("A5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${colors.pale}` } };
  sheet.getCell("A5").font = { color: { argb: `FF${colors.ink}` } };
  ["A", "B", "C", "D", "E", "F"].forEach((column) => { sheet.getColumn(column).width = 22; });
  sheet.getColumn("A").width = 28;
  return sheet;
}

function addFooterNote(sheet, row, text) {
  sheet.mergeCells(`A${row}:F${row}`);
  sheet.getCell(`A${row}`).value = text;
  sheet.getCell(`A${row}`).font = { italic: true, color: { argb: `FF${colors.muted}` } };
  sheet.getCell(`A${row}`).alignment = { wrapText: true };
}

function addTreasuryWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sphorix France";
  addIntro(workbook, "TABLEAU DE SUIVI DE TRESORERIE", "Suivre les encaissements, les décaissements et le solde mensuel.", "Les montants ci-dessous sont fictifs et servent uniquement à démontrer le fonctionnement du modèle.");

  const settings = workbook.addWorksheet("Paramètres");
  settings.addRow(["Catégories de flux"]);
  styleHeader(settings.getRow(1), colors.orange);
  ["Ventes", "Prestations", "Subventions", "Achats", "Salaires", "Abonnements", "Impôts et taxes", "Autre"].forEach((value) => settings.addRow([value]));
  settings.getColumn(1).width = 28;

  const input = workbook.addWorksheet("Saisie");
  input.addRow(["Date", "Type", "Catégorie", "Libellé", "Montant HT", "Commentaire"]);
  styleHeader(input.getRow(1));
  const rows = [
    [new Date(2026, 0, 5), "Entrée", "Ventes", "Facture client A", 4200, "Exemple fictif"],
    [new Date(2026, 0, 12), "Sortie", "Achats", "Fournitures", 650, "Exemple fictif"],
    [new Date(2026, 1, 8), "Entrée", "Prestations", "Mission client B", 2800, "Exemple fictif"],
    [new Date(2026, 1, 18), "Sortie", "Abonnements", "Outils numériques", 180, "Exemple fictif"],
  ];
  rows.forEach((row) => input.addRow(row));
  input.getColumn(1).numFmt = "dd/mm/yyyy";
  input.getColumn(5).numFmt = '#,##0.00 [$€-fr-FR]';
  [14, 14, 20, 28, 16, 24].forEach((width, index) => { input.getColumn(index + 1).width = width; });
  input.getColumn(2).eachCell((cell, index) => { if (index > 1) cell.dataValidation = { type: "list", formulae: ['"Entrée,Sortie"'] }; });
  input.autoFilter = "A1:F1";

  const monthly = workbook.addWorksheet("Suivi mensuel");
  monthly.addRow(["Mois", "Entrées", "Sorties", "Solde net"]);
  styleHeader(monthly.getRow(1), colors.green);
  for (let month = 1; month <= 12; month += 1) {
    const row = month + 1;
    monthly.addRow([new Date(2026, month - 1, 1), { formula: `SUMIFS(Saisie!$E:$E,Saisie!$B:$B,"Entrée",Saisie!$A:$A,">="&A${row},Saisie!$A:$A,"<"&EDATE(A${row},1))` }, { formula: `SUMIFS(Saisie!$E:$E,Saisie!$B:$B,"Sortie",Saisie!$A:$A,">="&A${row},Saisie!$A:$A,"<"&EDATE(A${row},1))` }, { formula: `B${row}-C${row}` }]);
  }
  monthly.getColumn(1).numFmt = "mmmm yyyy";
  [18, 18, 18, 18].forEach((width, index) => { monthly.getColumn(index + 1).width = width; });
  [2, 3, 4].forEach((column) => { monthly.getColumn(column).numFmt = '#,##0.00 [$€-fr-FR]'; });
  addFooterNote(monthly, 15, "Indicateur de suivi de gestion. Ce modèle ne remplace pas les comptes annuels ni les conseils d’un professionnel réglementé.");

  const dashboard = workbook.addWorksheet("Tableau de bord");
  dashboard.mergeCells("A1:F1");
  dashboard.getCell("A1").value = "TABLEAU DE BORD DE TRESORERIE";
  styleTitle(dashboard.getCell("A1"), colors.blue);
  dashboard.getRow(1).height = 34;
  dashboard.getCell("A3").value = "Total entrées";
  dashboard.getCell("B3").value = { formula: "SUM('Suivi mensuel'!B2:B13)" };
  dashboard.getCell("D3").value = "Total sorties";
  dashboard.getCell("E3").value = { formula: "SUM('Suivi mensuel'!C2:C13)" };
  dashboard.getCell("A5").value = "Solde net annuel";
  dashboard.getCell("B5").value = { formula: "SUM('Suivi mensuel'!D2:D13)" };
  ["A3", "D3", "A5"].forEach((address) => { dashboard.getCell(address).font = { bold: true, color: { argb: `FF${colors.ink}` } }; });
  ["B3", "E3", "B5"].forEach((address) => { dashboard.getCell(address).numFmt = '#,##0.00 [$€-fr-FR]'; dashboard.getCell(address).font = { size: 16, bold: true, color: { argb: `FF${colors.blue}` } }; });
  dashboard.getColumn("A").width = 24;
  dashboard.getColumn("B").width = 20;
  dashboard.getColumn("D").width = 24;
  dashboard.getColumn("E").width = 20;
  addFooterNote(dashboard, 8, "Données d’exemple fictives. Remplacez-les par vos données avant utilisation.");

  [settings, input, monthly, dashboard].forEach(styleSheet);
  return workbook.xlsx.writeFile(path.join(productsDir, "tableau-suivi-tresorerie.xlsx"));
}

function addExpensesWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sphorix France";
  addIntro(workbook, "TABLEAU DE SUIVI DES DEPENSES", "Centraliser, catégoriser et analyser les charges de votre activité.", "Les montants sont fictifs. Utilisez ce modèle comme base de suivi interne.");

  const categories = workbook.addWorksheet("Catégories");
  categories.addRow(["Catégories de dépenses"]);
  styleHeader(categories.getRow(1), colors.orange);
  ["Achats", "Salaires", "Loyer", "Transport", "Logiciels", "Communication", "Taxes", "Autre"].forEach((value) => categories.addRow([value]));
  categories.getColumn(1).width = 28;

  const input = workbook.addWorksheet("Saisie des dépenses");
  input.addRow(["Date", "Fournisseur", "Catégorie", "Description", "Montant TTC", "Payé ?"]);
  styleHeader(input.getRow(1));
  [
    [new Date(2026, 0, 4), "Fournisseur A", "Achats", "Matières premières", 840, "Oui"],
    [new Date(2026, 0, 15), "Outil B", "Logiciels", "Abonnement annuel", 240, "Oui"],
    [new Date(2026, 1, 11), "Prestataire C", "Communication", "Impression supports", 390, "Non"],
  ].forEach((row) => input.addRow(row));
  input.getColumn(1).numFmt = "dd/mm/yyyy";
  input.getColumn(5).numFmt = '#,##0.00 [$€-fr-FR]';
  [14, 22, 20, 30, 16, 14].forEach((width, index) => { input.getColumn(index + 1).width = width; });
  input.getColumn(6).eachCell((cell, index) => { if (index > 1) cell.dataValidation = { type: "list", formulae: ['"Oui,Non"'] }; });
  input.autoFilter = "A1:F1";

  const summary = workbook.addWorksheet("Synthèse mensuelle");
  summary.addRow(["Mois", "Total dépenses", "Dépenses payées", "Dépenses à payer"]);
  styleHeader(summary.getRow(1), colors.green);
  for (let month = 1; month <= 12; month += 1) {
    const row = month + 1;
    summary.addRow([new Date(2026, month - 1, 1), { formula: `SUMIFS('Saisie des dépenses'!$E:$E,'Saisie des dépenses'!$A:$A,">="&A${row},'Saisie des dépenses'!$A:$A,"<"&EDATE(A${row},1))` }, { formula: `SUMIFS('Saisie des dépenses'!$E:$E,'Saisie des dépenses'!$A:$A,">="&A${row},'Saisie des dépenses'!$A:$A,"<"&EDATE(A${row},1),'Saisie des dépenses'!$F:$F,"Oui")` }, { formula: `B${row}-C${row}` }]);
  }
  summary.getColumn(1).numFmt = "mmmm yyyy";
  [18, 20, 20, 20].forEach((width, index) => { summary.getColumn(index + 1).width = width; });
  [2, 3, 4].forEach((column) => { summary.getColumn(column).numFmt = '#,##0.00 [$€-fr-FR]'; });
  addFooterNote(summary, 15, "Outil de suivi interne. Vérifiez vos obligations comptables et fiscales avec votre professionnel habituel.");

  const analysis = workbook.addWorksheet("Analyse par catégorie");
  analysis.addRow(["Catégorie", "Total"]);
  styleHeader(analysis.getRow(1), colors.blue);
  ["Achats", "Salaires", "Loyer", "Transport", "Logiciels", "Communication", "Taxes", "Autre"].forEach((category, index) => {
    const row = index + 2;
    analysis.addRow([category, { formula: `SUMIF('Saisie des dépenses'!$C:$C,A${row},'Saisie des dépenses'!$E:$E)` }]);
  });
  analysis.getColumn(1).width = 24;
  analysis.getColumn(2).width = 18;
  analysis.getColumn(2).numFmt = '#,##0.00 [$€-fr-FR]';

  [categories, input, summary, analysis].forEach(styleSheet);
  return workbook.xlsx.writeFile(path.join(productsDir, "tableau-suivi-depenses.xlsx"));
}

function addDashboardWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sphorix France";
  addIntro(workbook, "TABLEAU DE BORD PETITE ENTREPRISE", "Rassembler les chiffres essentiels pour préparer les décisions du mois.", "Les chiffres sont fictifs et servent à illustrer la lecture du tableau de bord.");

  const data = workbook.addWorksheet("Données mensuelles");
  data.addRow(["Mois", "Chiffre d'affaires", "Dépenses", "Trésorerie", "Clients actifs"]);
  styleHeader(data.getRow(1));
  [
    [new Date(2026, 0, 1), 12500, 8200, 9300, 18],
    [new Date(2026, 1, 1), 13800, 9100, 10400, 21],
    [new Date(2026, 2, 1), 15100, 9700, 11900, 24],
  ].forEach((row) => data.addRow(row));
  data.getColumn(1).numFmt = "mmmm yyyy";
  [18, 22, 18, 18, 18].forEach((width, index) => { data.getColumn(index + 1).width = width; });
  [2, 3, 4].forEach((column) => { data.getColumn(column).numFmt = '#,##0.00 [$€-fr-FR]'; });

  const indicators = workbook.addWorksheet("Indicateurs");
  indicators.addRow(["Indicateur", "Valeur", "Lecture"]);
  styleHeader(indicators.getRow(1), colors.green);
  indicators.addRow(["CA cumulé", { formula: "SUM('Données mensuelles'!B2:B13)" }, "Volume d'activité sur la période"]);
  indicators.addRow(["Dépenses cumulées", { formula: "SUM('Données mensuelles'!C2:C13)" }, "Charges suivies sur la période"]);
  indicators.addRow(["Résultat simplifié", { formula: "B2-B3" }, "Indicateur de gestion, non comptable"]);
  indicators.addRow(["Trésorerie actuelle", { formula: "LOOKUP(2,1/('Données mensuelles'!D:D<>\"\"),'Données mensuelles'!D:D)" }, "Dernière valeur saisie"]);
  indicators.getColumn(1).width = 24;
  indicators.getColumn(2).width = 20;
  indicators.getColumn(3).width = 34;
  [2, 3, 4, 5].forEach((row) => { indicators.getCell(`B${row}`).numFmt = '#,##0.00 [$€-fr-FR]'; });

  const dashboard = workbook.addWorksheet("Tableau de bord");
  dashboard.mergeCells("A1:F1");
  dashboard.getCell("A1").value = "TABLEAU DE BORD - PETITE ENTREPRISE";
  styleTitle(dashboard.getCell("A1"), colors.navy);
  dashboard.getRow(1).height = 34;
  dashboard.getCell("A3").value = "CA cumulé";
  dashboard.getCell("B3").value = { formula: "Indicateurs!B2" };
  dashboard.getCell("D3").value = "Dépenses cumulées";
  dashboard.getCell("E3").value = { formula: "Indicateurs!B3" };
  dashboard.getCell("A5").value = "Résultat simplifié";
  dashboard.getCell("B5").value = { formula: "Indicateurs!B4" };
  dashboard.getCell("D5").value = "Trésorerie actuelle";
  dashboard.getCell("E5").value = { formula: "Indicateurs!B5" };
  ["A3", "D3", "A5", "D5"].forEach((address) => { dashboard.getCell(address).font = { bold: true, color: { argb: `FF${colors.ink}` } }; });
  ["B3", "E3", "B5", "E5"].forEach((address) => { dashboard.getCell(address).numFmt = '#,##0.00 [$€-fr-FR]'; dashboard.getCell(address).font = { size: 16, bold: true, color: { argb: `FF${colors.blue}` } }; });
  ["A", "B", "C", "D", "E", "F"].forEach((column) => { dashboard.getColumn(column).width = 22; });
  addFooterNote(dashboard, 8, "Le résultat affiché est un indicateur de gestion simplifié. Il ne remplace pas les comptes annuels ni les conseils d’un professionnel réglementé.");

  [data, indicators, dashboard].forEach(styleSheet);
  return workbook.xlsx.writeFile(path.join(productsDir, "tableau-bord-petite-entreprise.xlsx"));
}

function createVisual(slug, title, subtitle, accent) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <rect width="1200" height="900" fill="#f4f0e9"/>
  <rect x="70" y="70" width="1060" height="760" rx="42" fill="#0f172a"/>
  <circle cx="1010" cy="125" r="130" fill="none" stroke="${accent}" stroke-width="3" opacity=".7"/>
  <circle cx="1010" cy="125" r="88" fill="none" stroke="#ffffff" stroke-width="2" opacity=".25"/>
  <rect x="140" y="150" width="110" height="110" rx="24" fill="${accent}"/>
  <text x="195" y="220" fill="#0f172a" font-family="Arial,sans-serif" font-size="58" font-weight="700" text-anchor="middle">S</text>
  <text x="140" y="350" fill="#ffffff" font-family="Arial,sans-serif" font-size="62" font-weight="700">${title}</text>
  <text x="140" y="420" fill="#cbd5e1" font-family="Arial,sans-serif" font-size="28">${subtitle}</text>
  <rect x="140" y="520" width="920" height="180" rx="24" fill="#ffffff" opacity=".08"/>
  <line x1="190" y1="650" x2="1010" y2="650" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
  <line x1="190" y1="610" x2="760" y2="610" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity=".55"/>
  <line x1="190" y1="570" x2="900" y2="570" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity=".28"/>
  <text x="600" y="770" fill="#fb923c" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="2" text-anchor="middle">SPHORIX FRANCE · OUTIL DE GESTION</text>
  </svg>`;
  const svgPath = path.join(visualsDir, `${slug}.svg`);
  const pngPath = path.join(visualsDir, `${slug}.png`);
  writeFileSync(svgPath, svg);
  execFileSync("convert", [svgPath, pngPath]);
  copyFileSync(pngPath, path.join(publicVisualsDir, `${slug}.png`));
}

await Promise.all([
  addTreasuryWorkbook(),
  addExpensesWorkbook(),
  addDashboardWorkbook(),
]);

createVisual("tableau-suivi-tresorerie", "Suivi de trésorerie", "Entrées · sorties · solde mensuel", "#fb923c");
createVisual("tableau-suivi-depenses", "Suivi des dépenses", "Catégoriser · comprendre · agir", "#38bdf8");
createVisual("tableau-bord-petite-entreprise", "Tableau de bord", "Les chiffres essentiels au même endroit", "#34d399");

console.log(`Assets générés dans ${productsDir} et ${visualsDir}`);