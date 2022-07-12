# Automatically-update-google-form-options

語言：google apps script

功能：
1.利用google試算表自動更新google表單選項
2.不透過表單連結功能將表單回應依序即時更新至指定試算表
3.定期封存表單回應至指定試算表
4.當有人提交表單時利用lineNotify通知

1.
function formOptionsAutoUpate() {
  //Open form by id
  var form = FormApp.openById('your-form-id');
  var items = form.getItems();
  //Open spreadsheet by id
  var ss = SpreadsheetApp.openById('your-spreadsheet-id');

  //Find question ID
   for(var i in items) {
   console.log(items[i].getTitle() + ' - ' + items[i].getId())
   }

  //Declare question id list 
  var question_ID = [
    {name: "name", id: your-question-id},
     name: "name", id: your-question-id},
     name: "name", id: your-question-id}
    ];

  for (var i = 0; i < question_ID.length; i++) {
    //Get question by id
    var question = form.getItemById(question_ID[i].id);
    //Get sheet by name
    var sheet = ss.getSheetByName(question_ID[i].name);
    //Get range of column values
    var range = sheet.getRange(2,1,sheet.getLastRow(), 1);
    var test = range.getValues();
    //Preprocess the data and sort it by the first character
    test = test.flat();
    test = test.filter(row => row !== '');
    test = test.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', {sensitivity: 'accent'}))
    //Set the values to form option
    question.asMultipleChoiceItem().setChoiceValues(test);
  };
}

2.
function responsesToSheet(e){
  var form = FormApp.getActiveForm();
  var currentItemResponses = e.response.getItemResponses();
  answer = [[e.response.getTimestamp()]];
  for (var i = 0; i < currentItemResponses.length; i++) {    
      answer[0].push(currentItemResponses[i].getResponse());
  };
  Logger.log(answer)
  const ss = SpreadsheetApp.openById("your-spreadsheet-id");
  ss.getSheetByName('your-sheet-name').getRange(ss.getLastRow()+1,1,1,answer[0].length).setValues(answer);
}

3.
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

4.
function notifyPos(e) {
  var form = FormApp.getActiveForm();
  var currentItemResponses = e.response.getItemResponses();
  var message = "\n";
  Logger.log(currentItemResponses)
  if (currentItemResponses[5].getResponse() != 'negative') {
    for (var i = 0; i < currentItemResponses.length; i++) {    
      message += currentItemResponses[i].getItem().getTitle() + "：" + currentItemResponses[i].getResponse() + "\n\n";
    };
    message += "⏰填表時間：" + e.response.getTimestamp();
    sendMessage(message);
  }
}

var token = 'your-lineNotify-token';

function sendMessage(message) {
  var option = {
    method: 'post',
    headers: { Authorization: 'Bearer ' + token },
    payload: {
      message: message
    }
  };
  UrlFetchApp.fetch('https://notify-api.line.me/api/notify', option);
}
