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

  //Declare question id object 
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
