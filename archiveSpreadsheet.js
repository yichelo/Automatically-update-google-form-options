版本1:
function archiveSpreadsheetToFolder() {
  // Create a new blank file and name it by current time
  var timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  var date = Utilities.formatDate(new Date(), timezone, "EEE, d MMM yyyy HH:mm");
  var spreadsheet = SpreadsheetApp.create(date);
  // Move to the archive folder
  var file = DriveApp.getFileById(spreadsheet.getId());
  file.moveTo(DriveApp.getFolderById("your-folder-id"));
  // Copy the sheet from the source
  var ss = SpreadsheetApp.openById('your-spreadsheet-id');
  var sheet = ss.getSheetByName("your-sheet-name");
  sheet.copyTo(spreadsheet).setName("your-sheet-name");
  // Remove the default blank Sheet1
  var blankSheet = spreadsheet.getSheetByName('工作表1');
  if (blankSheet) spreadsheet.deleteSheet(blankSheet);

  //Clear spreadsheet responses
  var ss = SpreadsheetApp.openById('your-sheet-id');
  var sheet = ss.getSheetByName("your-sheet-name");
  sheet.clear();
  var answers = ['時間戳記', 'question1', 'question2', 'question3', 'question4', 'question5','question6'];
  var range = sheet.getRange(1,1,1,answers.length);
  range.setValues([answers]);

  //Clear form responses
  var form = FormApp.openById('your-form-id'); 
  form.deleteAllResponses();
}

版本2:
function allResponsesToSheet(){
  const form = FormApp.getActiveForm();
  const formResponses = form.getResponses();
  const formReply = []
  const ss = SpreadsheetApp.openById("your-sheet-id");
  const FinalSheet = ss.getSheetByName('your-sheet-name');
  const answers = []
  formResponses.forEach((formResponse)=>{
    const itemResponses = formResponse.getItemResponses();
    answer = {'時間戳記':formResponse.getTimestamp(), 'question1':'', 'question2':'', 'question3':'',
      'question4':'', 'question5':'', 'quetion6':'', 'question7':''};
    for (var i = 0; i < itemResponses.length; i++) {
      answer[itemResponses[i].getItem().getTitle()] = itemResponses[i].getResponse();
    }; 
    answers.push(Object.values(answer));
  })
  
  FinalSheet.getRange(ss.getLastRow()+1,1,answers.length,answers[0].length).setValues(answers);

  //Clear form responses
  var del_form = FormApp.openById('your-form-id'); 
  del_form.deleteAllResponses();
}
