/**
 * Script do Google Apps Script que salva os leads do formulário na planilha.
 *
 * COMO PUBLICAR:
 * 1. Abra a planilha: https://docs.google.com/spreadsheets/d/1SR-NAdal2cFZtmAMcV_a3x4xqtVQxqqzrdmhQRpBOcg/edit
 * 2. Menu: Extensões > Apps Script
 * 3. Apague o conteúdo e cole este script
 * 4. Salve (Ctrl+S)
 * 5. Implantar > Gerenciar implantações > editar a implantação existente
 *    (lápis) > Versão: "Nova versão" > Implantar
 *    A URL /exec continua a mesma.
 *
 * Cabeçalho da linha 1 da aba:
 * Data | Nome | Email | WhatsApp | Cargo | Empresa | Instagram | Faturamento mensal
 */

var SHEET_ID = '1SR-NAdal2cFZtmAMcV_a3x4xqtVQxqqzrdmhQRpBOcg';
var SHEET_TAB = 'Página1';

function doPost(e) {
  try {
    // Funciona vinculado à planilha ou como script avulso.
    var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_TAB) || ss.getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    var row = [
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.cargo || '',
      data.companyName || '',
      data.instagram || '',
      data.faturamentoMensal || ''
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
