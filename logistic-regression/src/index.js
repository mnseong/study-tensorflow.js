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

const renderHistogram = (data, container, column, config) => {
  const diabetic = data.filter((r) => r.Outcome === 1).map((r) => r[column]);
  const healthy = data.filter((r) => r.Outcome === 0).map((r) => r[column]);

  const dTrace = {
    name: "diabetic",
    x: diabetic,
    opacity: 0.5,
    type: "histogram",
    marker: {
      color: "gold",
    },
  };

  const hTrace = {
    name: "healthy",
    x: healthy,
    opacity: 0.5,
    type: "histogram",
    marker: {
      color: "forestgreen",
    },
  };

  Plotly.newPlot(container, [dTrace, hTrace], {
    barmode: "overlay",
    title: config.title,
    xaxis: {
      title: config.xLabel,
    },
    yaxis: {
      title: config.yLabel,
    },
  });
};

const renderScatter = (data, container, columns, config) => {
  const diabetic = data.filter((r) => r.Outcome === 1);
  const healthy = data.filter((r) => r.Outcome === 0);

  const dTrace = {
    x: diabetic.map((r) => r[columns[0]]),
    y: diabetic.map((r) => r[columns[1]]),
    mode: "markers",
    marker: {
      color: "gold",
    },
  };

  const hTrace = {
    x: healthy.map((r) => r[columns[0]]),
    y: healthy.map((r) => r[columns[1]]),
    mode: "markers",
    marker: {
      color: "forestgreen",
    },
  };

  Plotly.newPlot(container, [dTrace, hTrace], {
    title: config.title,
    xaxis: {
      title: config.xLabel,
    },
    yaxis: {
      title: config.yLabel,
    },
  });
};

const run = async () => {
  const data = await loadData();
  console.log(data);
  renderPieChart(data);
  renderHistogram(data, "histogram-insulin-cont", "Insulin", {
    title: "Insulin levels",
    xLabel: "2-Hour serum insulin (mu U/ml)",
    yLabel: "Count",
  });
  renderHistogram(data, "histogram-glucose-cont", "Glucose", {
    title: "Glucose concentration",
    xLabel:
      "Plasma glucose concentration a 2 hours in an oral glucose tolerance test",
    yLabel: "Count",
  });
  renderHistogram(data, "histogram-age-cont", "Age", {
    title: "Age",
    xLabel: "Age",
    yLabel: "Age(years)",
  });
};

if (document.readyState !== "loading") {
  run();
} else {
  document.addEventListener("DOMContentLoaded", run);
}
