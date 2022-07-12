function responsesToSheet(e){
  var form = FormApp.getActiveForm();
  var currentItemResponses = e.response.getItemResponses();
  answer = [[e.response.getTimestamp()]];
  for (var i = 0; i < currentItemResponses.length; i++) {    
      answer[0].push(currentItemResponses[i].getResponse());
  };
  Logger.log(answer)
  const ss = SpreadsheetApp.openById("your-spreadsheet-id");
  ss.getSheetByName('your-sheet-name').getRange(ss.getSheetByName('your-sheet-name').getLastRow()+1,1,1,answer[0].length).setValues(answer);
}
