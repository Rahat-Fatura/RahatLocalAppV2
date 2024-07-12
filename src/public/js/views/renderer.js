const ipc = require('electron').ipcRenderer;

closeApp = (e) => {
  e.preventDefault();
  ipc.send('close');
};

minimizeApp = (e) => {
  e.preventDefault();
  ipc.send('minimize');
};

maximizeApp = (e) => {
  e.preventDefault();
  ipc.send('maximize');
};

backPage = (e) => {
  e.preventDefault();
  ipc.send('back');
};

forwardPage = (e) => {
  e.preventDefault();
  ipc.send('forward');
};

refreshPage = (e) => {
  e.preventDefault();
  ipc.send('refresh');
};

$(document).ready(() => {
  $('#closeBtn').click(closeApp);
  $('#minimizeBtn').click(minimizeApp);
  $('#maximizeBtn').click(maximizeApp);
  $('#backBtn').click(backPage);
  $('#forwardBtn').click(forwardPage);
  $('#refreshBtn').click(refreshPage);
});
