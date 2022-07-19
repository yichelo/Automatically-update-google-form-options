# Automatically-update-google-form-options

**語言： google apps script**

## 一、利用google試算表自動更新google表單選項
* 利用表單及試算表的ID來開啟指定的表單及試算表。
```js
//Open form by id
var form = FormApp.openById('your-form-id');
//Open spreadsheet by id
var ss = SpreadsheetApp.openById('your-spreadsheet-id');
```
* 表單的每一個區段都有一個ID，因此我們需要找出我們要更動的區段的ID。
```js
//Find question ID
var items = form.getItems();
for(var i in items) {
  console.log(items[i].getTitle() + ' - ' + items[i].getId())
}
```
* 將ID加入key值name做成一個 js object。
```js
//Declare question id object
var question_ID = [
  {name: "name", id: your-question-id},
   name: "name", id: your-question-id},
   name: "name", id: your-question-id}
  ];
```
* 用每個區段ID的key值name在試算表中建立工作表，並以該工作表第一欄第二列(A2)開始抓Value(A2.A3.A4...)到最末列。  
* 抓完所有Value之後清除空值並以字首排序。  
* 最後將Value轉為選項後放入表單。  
```js
//Get question by id
var question = form.getItemById('your-question-id');
//Get sheet by name
var sheet = ss.getSheetByName('your-sheet-name');
//Get range of column values
var range = sheet.getRange(2,1,sheet.getLastRow(), 1);
var test = range.getValues();
//Preprocess the data and sort it by the first chinese character
test = test.flat();
test = test.filter(row => row !== '');
test = test.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', {sensitivity: 'accent'}))
//Set the values to form option
question.asMultipleChoiceItem().setChoiceValues(test);
```
## 二、不透過表單連結功能將表單回應依序即時更新至指定試算表
**※這個function需要放在表單生成的apps script專案內。**  
**※這個function需要設定觸發條件在提交表單時觸發。**
```js
function responsesToSheet(e){
  //Get current form 
  var form = FormApp.getActiveForm();
  //Get current timestamp and response
  var currentItemResponses = e.response.getItemResponses();
  answer = [[e.response.getTimestamp()]];
  for (var i = 0; i < currentItemResponses.length; i++) {    
      answer[0].push(currentItemResponses[i].getResponse());
  };
  Logger.log(answer)
  //Get Spreadsheet by id and get sheet by name, then put it into last empty row
  const ss = SpreadsheetApp.openById("your-spreadsheet-id");
  ss.getSheetByName('your-sheet-name').getRange(ss.getSheetByName('your-sheet-name').getLastRow()+1,1,1,answer[0].length).setValues(answer);
}
```
## 三、定期封存表單回應至指定試算表
*版本1:archiveSpreadsheetToFolder()*  
**※這個function需要放在指定試算表生成的apps script專案內。**
* 在雲端硬碟新增一個空的試算表並以當下的時間命名。
```js
// Create a new blank file and name it by current time
var timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
var date = Utilities.formatDate(new Date(), timezone, "EEE, d MMM yyyy HH:mm");
var spreadsheet = SpreadsheetApp.create(date);
```
* 抓取指定資料夾ID並將剛新增的試算表放入。
```js
// Move to the archive folder
var file = DriveApp.getFileById(spreadsheet.getId());
file.moveTo(DriveApp.getFolderById("your-folder-id"));
```
* 以試算表id和工作表名稱抓取要複製的工作表，複製到剛新增的試算表並重新命名一個新的工作表放入。
```js
// Copy the sheet from the source
var ss = SpreadsheetApp.openById('your-spreadsheet-id');
var sheet = ss.getSheetByName("your-sheet-name");
sheet.copyTo(spreadsheet).setName("your-new-sheet-name");
```
* 移除剛新增的試算表中內建的空白工作表1
```js
// Remove the default blank Sheet1
var blankSheet = spreadsheet.getSheetByName('工作表1');
if (blankSheet) spreadsheet.deleteSheet(blankSheet);
```
* 清除原本試算表及表單的回應，並將原本表單回應的各標題放入試算表第一列。
```js
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
```
*版本2:allResponsesToSheet()*  
**※這個function需要放在表單生成的apps script專案內。**
* 將表單內的所有回應放入指定試算表中的指定工作表內。
```js
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
FinalSheet.getRange(FinalSheet.getLastRow()+1,1,answers.length,answers[0].length).setValues(answers);
```
* 清除表單內的所有回覆。
```js
//Clear form responses
var del_form = FormApp.openById('your-form-id'); 
del_form.deleteAllResponses();
```
## 四、當有人提交表單時利用lineNotify通知
**※這個function需要放在表單生成的apps script專案內。**
**※這個function需要設定觸發條件在提交表單時觸發。**
* 抓取提交表單的回應並加入時間標記並放入變數message中。
```js
function notifyPos(e) {
  var form = FormApp.getActiveForm();
  var currentItemResponses = e.response.getItemResponses();
  var message = "\n";
  Logger.log(currentItemResponses)
  for (var i = 0; i < currentItemResponses.length; i++) {    
    message += currentItemResponses[i].getItem().getTitle() + "：" + currentItemResponses[i].getResponse() + "\n\n";
  };
  message += "⏰填表時間：" + e.response.getTimestamp();
  sendMessage(message);
}
```
* 你的LineNotify權杖
```js
var token = 'your-lineNotify-token';
```
* 送出回應，若要新增貼圖之類的東西請看官方文件並在payload區塊中新增。
```js
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
```
