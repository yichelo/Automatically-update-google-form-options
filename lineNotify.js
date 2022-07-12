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
