import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
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

const oneHot = (outcome) => Array.from(tf.oneHot([outcome], 2).dataSync());

const createDatasets = (data, features, testSize, batchSize) => {
  const X = data.map((r) =>
    features.map((f) => {
      const val = r[f];
      return val === undefined ? 0 : val;
    })
  );
  const y = data.map((r) => {
    const outcome = r.Outcome === undefined ? 0 : r.Outcome;
    return oneHot(outcome);
  });
  const splitIdx = parseInt((1 - testSize) * data.length, 10);

  const ds = tf.data
    .zip({
      xs: tf.data.array(X),
      ys: tf.data.array(y),
    })
    .shuffle(data.length, 42);

  return [
    ds.take(splitIdx).batch(batchSize),
    ds.skip(splitIdx + 1).batch(batchSize),
  ];
};

const trainLogisticRegression = async (featureCount, trainDs, validDs) => {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 2,
      activation: "softmax",
      inputShape: [featureCount],
    })
  );
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });
  const trainLogs = [];
  const lossContainer = document.getElementById("loss-cont");
  const accContainer = document.getElementById("acc-cont");
  await model.fitDataset(trainDs, {
    epochs: 100,
    validationData: validDs,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        trainLogs.push(logs);
        tfvis.show.history(lossContainer, trainLogs, ["loss", "val_loss"]);
        tfvis.show.history(accContainer, trainLogs, ["acc", "val_acc"]);
      },
    },
  });
  return model;
};

const run = async () => {
  const data = await loadData();

  const [trainDs, validDs] = createDatasets(data, ["Glucose"], 0.1, 16);
  const model = await trainLogisticRegression(1, trainDs, validDs);

  console.log("Done training");
  // const trainVals = trainDs.take(10);
  // await trainVals.forEachAsync((e) => console.log(e));

  // console.log(data);
  // console.log(data[0]);
  // renderPieChart(data);
  // renderHistogram(data, "histogram-insulin-cont", "Insulin", {
  //   title: "Insulin levels",
  //   xLabel: "2-Hour serum insulin (mu U/ml)",
  //   yLabel: "Count",
  // });
  // renderHistogram(data, "histogram-glucose-cont", "Glucose", {
  //   title: "Glucose concentration",
  //   xLabel:
  //     "Plasma glucose concentration a 2 hours in an oral glucose tolerance test",
  //   yLabel: "Count",
  // });
  // renderHistogram(data, "histogram-age-cont", "Age", {
  //   title: "Age",
  //   xLabel: "Age",
  //   yLabel: "Age(years)",
  // });
  // renderScatter(data, "scatter-glucose-age-cont", ["Glucose", "Age"], {
  //   title: "Glucose vs Age",
  //   xLabel: "Glucose",
  //   yLabel: "Age",
  // });
  // renderScatter(
  //   data,
  //   "scatter-skinthickness-bmi-cont",
  //   ["SkinThickness", "BMI"],
  //   {
  //     title: "SkinThickness vs BMI",
  //     xLabel: "SkinThickness",
  //     yLabel: "BMI",
  //   }
  // );
};

if (document.readyState !== "loading") {
  run();
} else {
  document.addEventListener("DOMContentLoaded", run);
}
