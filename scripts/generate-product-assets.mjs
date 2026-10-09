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
  workbook.properties.title = "SADesk - Tableau de suivi de trésorerie";
  workbook.properties.subject = "Suivi de trésorerie sur 90 jours";

  const welcome = workbook.addWorksheet("01_ACCUEIL");
  welcome.mergeCells("A1:F1");
  welcome.getCell("A1").value = "SADesk  |  TABLEAU DE SUIVI DE TRÉSORERIE";
  styleTitle(welcome.getCell("A1"), colors.navy);
  welcome.getRow(1).height = 36;
  welcome.mergeCells("A3:F3");
  welcome.getCell("A3").value = "Pilotez votre trésorerie simplement.";
  welcome.getCell("A3").font = { name: "Aptos Display", size: 18, bold: true, color: { argb: `FF${colors.ink}` } };
  welcome.mergeCells("A5:F5");
  welcome.getCell("A5").value = "1. Configurez vos paramètres  •  2. Saisissez vos flux  •  3. Consultez vos prévisions et alertes";
  welcome.getCell("A5").alignment = { horizontal: "center" };
  [["A7:B9", "💰 SAISIR MES FLUX", "03_FLUX!A1"], ["C7:D9", "📊 VOIR MA TRÉSORERIE", "04_TABLEAU_DE_BORD!A1"], ["E7:F9", "⚠ VOIR MES ALERTES", "04_TABLEAU_DE_BORD!A20"]].forEach(([range, label, target]) => {
    welcome.mergeCells(range);
    const cell = welcome.getCell(range.split(":")[0]);
    cell.value = { text: label, hyperlink: `#'${target.split("!")[0]}'!${target.split("!")[1]}` };
    cell.font = { bold: true, color: { argb: `FF${colors.white}` }, size: 13 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${colors.blue}` } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  });
  welcome.mergeCells("A12:F13");
  welcome.getCell("A12").value = "Les montants d'exemple sont fictifs. Les cellules bleues sont à renseigner ; les cellules blanches sont calculées automatiquement.";
  welcome.getCell("A12").alignment = { wrapText: true, vertical: "middle" };
  welcome.getCell("A12").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };
  addFooterNote(welcome, 16, "Dernière mise à jour : 19/09/2026 · Outil de gestion, non comptable.");

  const settings = workbook.addWorksheet("02_PARAMETRES");
  settings.addRow(["PARAMÈTRES DE L'ENTREPRISE", "Valeur"]);
  styleHeader(settings.getRow(1), colors.navy);
  [["Nom de l'entreprise", "Entreprise exemple"], ["Période de suivi", "90 jours"], ["Devise", "EUR"], [], ["TRÉSORERIE", "Valeur"], ["Solde initial", 25000], ["Seuil de sécurité", 10000], ["Date du solde initial", new Date(2026, 8, 1)]].forEach((row) => settings.addRow(row));
  styleHeader(settings.getRow(6), colors.orange);
  settings.getCell("B7").numFmt = '#,##0.00 [$€-fr-FR]';
  settings.getCell("B8").numFmt = '#,##0.00 [$€-fr-FR]';
  settings.getCell("B9").numFmt = "dd/mm/yyyy";
  ["B2", "B3", "B4", "B7", "B8", "B9"].forEach((address) => {
    settings.getCell(address).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCEEFF" } };
    settings.getCell(address).protection = { locked: false };
  });
  settings.getColumn(1).width = 30;
  settings.getColumn(2).width = 24;

  const flow = workbook.addWorksheet("03_FLUX");
  flow.addRow(["Saisissez un montant toujours positif : le type de flux détermine automatiquement son impact sur la trésorerie."]);
  flow.mergeCells("A1:H1");
  flow.getCell("A1").font = { italic: true, color: { argb: `FF${colors.muted}` } };
  flow.addRow(["Date", "Type", "Catégorie", "Libellé", "Montant", "Statut", "Commentaire", "Impact trésorerie"]);
  styleHeader(flow.getRow(2), colors.blue);
  const flows = [
    [new Date(2026, 8, 5), "Encaissement", "Ventes", "Facture ABC", 3500, "Prévu", "Exemple fictif"],
    [new Date(2026, 8, 7), "Décaissement", "Fournisseurs", "Matériaux", 1200, "Prévu", "Exemple fictif"],
    [new Date(2026, 8, 10), "Décaissement", "Salaires", "Salaires", 5000, "Prévu", "Exemple fictif"],
    [new Date(2026, 8, 15), "Encaissement", "Ventes", "Facture XYZ", 2800, "Réalisé", "Exemple fictif"],
  ];
  flows.forEach((row, index) => flow.addRow([...row, { formula: `IF(B${index + 3}="Encaissement",E${index + 3},-E${index + 3})` }]));
  for (let row = 3; row <= 502; row += 1) {
    if (row > 6) flow.getCell(`H${row}`).value = { formula: `IF(B${row}="","",IF(B${row}="Encaissement",E${row},-E${row}))` };
    ["A", "B", "C", "D", "E", "F", "G"].forEach((column) => {
      flow.getCell(`${column}${row}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCEEFF" } };
      flow.getCell(`${column}${row}`).protection = { locked: false };
    });
    flow.getCell(`A${row}`).dataValidation = { type: "date", operator: "between", formulae: ["DATE(2020,1,1)", "DATE(2100,12,31)"], showErrorMessage: true, errorTitle: "Date obligatoire", error: "Saisissez une date valide." };
    flow.getCell(`B${row}`).dataValidation = { type: "list", formulae: ["'99_LISTES'!$A$2:$A$3"], showErrorMessage: true, error: "Sélectionnez Encaissement ou Décaissement." };
    flow.getCell(`C${row}`).dataValidation = { type: "list", formulae: ["'99_LISTES'!$B$2:$B$18"], showErrorMessage: true, error: "Sélectionnez une catégorie." };
    flow.getCell(`E${row}`).dataValidation = { type: "decimal", operator: "greaterThan", formulae: ["0"], showErrorMessage: true, errorTitle: "Montant incorrect", error: "Saisissez un montant positif." };
    flow.getCell(`F${row}`).dataValidation = { type: "list", formulae: ["'99_LISTES'!$C$2:$C$3"], showErrorMessage: true, error: "Sélectionnez Prévu ou Réalisé." };
  }
  flow.getColumn(1).numFmt = "dd/mm/yyyy";
  [5, 8].forEach((column) => { flow.getColumn(column).numFmt = '#,##0.00 [$€-fr-FR]'; });
  [14, 18, 22, 30, 16, 14, 28, 18].forEach((width, index) => { flow.getColumn(index + 1).width = width; });
  flow.autoFilter = "A2:H502";
  flow.views = [{ state: "frozen", ySplit: 2 }];

  const forecast = workbook.addWorksheet("05_PREVISION");
  forecast.addRow(["Date", "Encaissements prévus", "Décaissements prévus", "Encaissements réalisés", "Décaissements réalisés", "Solde prévisionnel", "Seuil de sécurité", "Alerte"]);
  styleHeader(forecast.getRow(1), colors.green);
  for (let day = 0; day < 90; day += 1) {
    const row = day + 2;
    forecast.addRow([
      day === 0 ? { formula: "'02_PARAMETRES'!B9" } : { formula: `A${row - 1}+1` },
      { formula: `SUMIFS('03_FLUX'!$E$3:$E$502,'03_FLUX'!$A$3:$A$502,A${row},'03_FLUX'!$B$3:$B$502,"Encaissement",'03_FLUX'!$F$3:$F$502,"Prévu")` },
      { formula: `SUMIFS('03_FLUX'!$E$3:$E$502,'03_FLUX'!$A$3:$A$502,A${row},'03_FLUX'!$B$3:$B$502,"Décaissement",'03_FLUX'!$F$3:$F$502,"Prévu")` },
      { formula: `SUMIFS('03_FLUX'!$E$3:$E$502,'03_FLUX'!$A$3:$A$502,A${row},'03_FLUX'!$B$3:$B$502,"Encaissement",'03_FLUX'!$F$3:$F$502,"Réalisé")` },
      { formula: `SUMIFS('03_FLUX'!$E$3:$E$502,'03_FLUX'!$A$3:$A$502,A${row},'03_FLUX'!$B$3:$B$502,"Décaissement",'03_FLUX'!$F$3:$F$502,"Réalisé")` },
      { formula: row === 2 ? "'02_PARAMETRES'!B7+D2-E2+B2-C2" : `F${row - 1}+D${row}-E${row}+B${row}-C${row}` },
      { formula: "'02_PARAMETRES'!B8" },
      { formula: `IF(F${row}<G${row},"ALERTE",IF(F${row}<G${row}*1.2,"VIGILANCE","NORMAL"))` },
    ]);
  }
  forecast.getColumn(1).numFmt = "dd/mm/yyyy";
  [2, 3, 4, 5, 6, 7].forEach((column) => { forecast.getColumn(column).numFmt = '#,##0.00 [$€-fr-FR]'; });
  [14, 20, 22, 22, 22, 22, 18, 14].forEach((width, index) => { forecast.getColumn(index + 1).width = width; });
  forecast.views = [{ state: "frozen", ySplit: 1 }];
  forecast.addConditionalFormatting({ ref: "H2:H91", rules: [{ type: "containsText", operator: "containsText", text: "ALERTE", style: { fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } }, font: { color: { argb: "FFB91C1C" }, bold: true } } }, { type: "containsText", operator: "containsText", text: "VIGILANCE", style: { fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFEDD5" } }, font: { color: { argb: "FFC2410C" }, bold: true } } }] });

  const dashboard = workbook.addWorksheet("04_TABLEAU_DE_BORD");
  dashboard.mergeCells("A1:H1");
  dashboard.getCell("A1").value = "TABLEAU DE BORD DE TRÉSORERIE";
  styleTitle(dashboard.getCell("A1"), colors.navy);
  dashboard.getRow(1).height = 36;
  dashboard.addRow([]);
  [["TRÉSORERIE ACTUELLE", "B4", "'02_PARAMETRES'!B7+SUMIFS('03_FLUX'!$H$3:$H$502,'03_FLUX'!$F$3:$F$502,\"Réalisé\")"], ["PRÉVISION À 30 JOURS", "E4", "'05_PREVISION'!F31"], ["PRÉVISION À 60 JOURS", "B8", "'05_PREVISION'!F61"], ["PRÉVISION À 90 JOURS", "E8", "'05_PREVISION'!F91"]].forEach(([label, valueCell, formula]) => {
    const labelCell = valueCell === "B4" ? "A4" : valueCell === "E4" ? "D4" : valueCell === "B8" ? "A8" : "D8";
    dashboard.getCell(labelCell).value = label;
    dashboard.getCell(labelCell).font = { bold: true, color: { argb: `FF${colors.ink}` } };
    dashboard.getCell(valueCell).value = { formula };
    dashboard.getCell(valueCell).numFmt = '#,##0.00 [$€-fr-FR]';
    dashboard.getCell(valueCell).font = { size: 17, bold: true, color: { argb: `FF${colors.blue}` } };
  });
  dashboard.getCell("A12").value = "SEUIL DE SÉCURITÉ";
  dashboard.getCell("B12").value = { formula: "'02_PARAMETRES'!B8" };
  dashboard.getCell("D12").value = "ÉCART AU SEUIL À 90 J.";
  dashboard.getCell("E12").value = { formula: "E8-B12" };
  dashboard.getCell("A16").value = "POINT DE TENSION PRÉVISIONNEL";
  dashboard.getCell("B16").value = { formula: "IFERROR(INDEX('05_PREVISION'!A2:A91,MATCH(TRUE,'05_PREVISION'!F2:F91<'05_PREVISION'!G2:G91,0)),\"Aucun sur 90 jours\")" };
  dashboard.getCell("D16").value = "DÉCAISSEMENTS À 7 JOURS";
  dashboard.getCell("E16").value = { formula: "SUM('05_PREVISION'!C2:C8)" };
  dashboard.getCell("B16").numFmt = "dd/mm/yyyy";
  ["B12", "E12", "E16"].forEach((address) => { dashboard.getCell(address).numFmt = '#,##0.00 [$€-fr-FR]'; });
  ["A12", "D12", "A16", "D16"].forEach((address) => { dashboard.getCell(address).font = { bold: true, color: { argb: `FF${colors.ink}` } }; });
  dashboard.mergeCells("A20:H23");
  dashboard.getCell("A20").value = { formula: "IF(MIN('05_PREVISION'!F2:F91)<'02_PARAMETRES'!B8,\"⚠ ALERTE : votre trésorerie prévisionnelle passe sous votre seuil de sécurité. Consultez le point de tension et les flux à venir.\",IF(MIN('05_PREVISION'!F2:F91)<'02_PARAMETRES'!B8*1.2,\"⚠ VIGILANCE : votre trésorerie prévisionnelle se rapproche de votre seuil de sécurité.\",\"✓ Situation normale : votre trésorerie prévisionnelle reste supérieure à votre seuil de sécurité.\"))" };
  dashboard.getCell("A20").alignment = { wrapText: true, vertical: "middle" };
  dashboard.getCell("A20").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF7ED" } };
  dashboard.mergeCells("A25:H27");
  dashboard.getCell("A25").value = { formula: "\"Situation de trésorerie : solde actuel \"&TEXT(B4,\"#,##0.00 €\")&\". Sur les 90 prochains jours, le minimum prévisionnel est \"&TEXT(MIN('05_PREVISION'!F2:F91),\"#,##0.00 €\")&\".\"" };
  dashboard.getCell("A25").alignment = { wrapText: true, vertical: "middle" };
  ["A", "B", "C", "D", "E", "F", "G", "H"].forEach((column) => { dashboard.getColumn(column).width = 18; });

  const help = workbook.addWorksheet("06_AIDE");
  help.mergeCells("A1:F1");
  help.getCell("A1").value = "AIDE — TABLEAU DE SUIVI DE TRÉSORERIE";
  styleTitle(help.getCell("A1"), colors.navy);
  [["1. Configurer", "Dans 02_PARAMETRES, renseignez le solde initial, sa date et votre seuil de sécurité."], ["2. Saisir", "Dans 03_FLUX, saisissez chaque flux avec un montant toujours positif. Le type Encaissement ou Décaissement gère le signe automatiquement."], ["3. Prévoir", "Les flux Prévu alimentent automatiquement la projection quotidienne de 90 jours."], ["4. Lire le tableau de bord", "Le tableau de bord affiche les soldes à 30, 60 et 90 jours, ainsi que la première date de passage sous le seuil."], ["5. Comprendre les alertes", "Normal : au-dessus du seuil. Vigilance : à moins de 20 % du seuil. Alerte : sous le seuil de sécurité."]].forEach(([title, text], index) => {
    const row = 3 + index * 3;
    help.getCell(`A${row}`).value = title;
    help.getCell(`A${row}`).font = { bold: true, color: { argb: `FF${colors.blue}` } };
    help.mergeCells(`B${row}:F${row + 1}`);
    help.getCell(`B${row}`).value = text;
    help.getCell(`B${row}`).alignment = { wrapText: true, vertical: "middle" };
  });
  ["A", "B", "C", "D", "E", "F"].forEach((column) => { help.getColumn(column).width = column === "A" ? 26 : 21; });

  const lists = workbook.addWorksheet("99_LISTES");
  lists.addRow(["Types", "Catégories", "Statuts"]);
  styleHeader(lists.getRow(1), colors.navy);
  const categories = ["Ventes", "Prestations", "Acomptes", "Autres encaissements", "Achats", "Fournisseurs", "Sous-traitance", "Salaires", "Charges sociales", "Impôts et taxes", "TVA", "Loyer", "Assurances", "Énergie", "Télécommunications", "Véhicule", "Carburant", "Emprunt", "Investissement", "Autres dépenses"];
  const rowCount = Math.max(2, categories.length + 1);
  for (let row = 2; row <= rowCount; row += 1) lists.addRow([row <= 3 ? ["Encaissement", "Décaissement"][row - 2] : "", categories[row - 2] ?? "", row <= 3 ? ["Réalisé", "Prévu"][row - 2] : ""]);
  lists.state = "veryHidden";

  dashboard.orderNo = 4;
  forecast.orderNo = 5;

  [welcome, settings, flow, dashboard, forecast, help].forEach(styleSheet);
  [welcome, settings, flow, dashboard, forecast, help].forEach((sheet) => {
    sheet.protect("sadesk", { selectLockedCells: true, selectUnlockedCells: true, formatCells: false, insertRows: false, deleteRows: false });
  });
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