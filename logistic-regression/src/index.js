import * as Papa from "papaparse";

Papa.parsePromise = (file) => {
  return new Promise((complete, error) => {
    Papa.parse(file, {
      header: true,
      download: true,
      dynamicTyping: true,
      complete,
      error,
    });
  });
};

const loadData = async () => {
  const csv = await Papa.parsePromise(
    "https://raw.githubusercontent.com/mnseong/study-tensorflow.js/main/logistic-regression/data/diabetes.csv"
  );
  return csv;
};

const run = async () => {
  const data = await loadData();
  console.log(data);
};

if (document.readyState !== "loading") {
  run();
} else {
  document.addEventListener("DOMContentLoaded", run);
}
