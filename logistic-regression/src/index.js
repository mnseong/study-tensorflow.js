import * as Papa from "papaparse";
import Plotly from "plotly.js-dist";
import _ from "lodash";

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
  return csv.data;
};

const renderPieChart = (data) => {
  const outcomes = data.map((r) => r.Outcome);
  const [diabetic, healthy] = _.partition(outcomes, (outcome) => outcome === 1);
  const chartData = [
    {
      labels: ["Diabetic", "Healthy"],
      values: [diabetic.length, healthy.length],
      type: "pie",
      opacity: 0.6,
      marker: {
        colors: ["gold", "forestgreen"],
      },
    },
  ];
  Plotly.newPlot("piechart-cont", chartData);
};

const run = async () => {
  const data = await loadData();
  console.log(data);
  renderPieChart(data);
};

if (document.readyState !== "loading") {
  run();
} else {
  document.addEventListener("DOMContentLoaded", run);
}
