import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Colors,
  CategoryScale,
  LinearScale,
  BarElement,
  LineController,
  BarController,
  PointElement,
  LineElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie, Bar } from "react-chartjs-2";
import { extractNumberFromString, calculateArrayAvg } from "../assets/Helper";
import "./Graph.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Colors,
  CategoryScale,
  LinearScale,
  BarElement,
  LineController,
  BarController,
  PointElement,
  LineElement
);

const BACKGROUND_COLOR = [
  "rgba(255, 99, 132, 0.2)",
  "rgba(54, 162, 235, 0.2)",
  "rgba(255, 206, 86, 0.2)",
  "rgba(75, 192, 192, 0.2)",
  "rgba(153, 102, 255, 0.2)",
  "rgba(255, 159, 64, 0.2)",
];

const BORDER_COLOR = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
];

const Graph = () => {
  const [loading, setLoading] = useState(false);
  const [processors, setProcessors] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        await retrieveData();
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const retrieveData = async () => {
    let result = await getProcessors();
    setProcessors(result.data);
    setTotalRecords(result.totalRecords);
  };

  const getProcessors = async () => {
    let result = await axios.get("http://localhost:8000/processors");
    return result.data;
  };

  const generateBarData = (processors, totalRecords) => {
    const segments = {};
    processors.forEach((data) => {
      let segment = data?.Essentials?.["Vertical Segment"];
      let lithography = extractNumberFromString(
        data?.Essentials?.["Lithography"]
      );
      let baseFrequency = extractNumberFromString(
        data?.["Performance"]?.["Processor Base Frequency"]
      );
      if (segment) {
        if (!segments[segment]) {
          segments[segment] = {
            lithography: lithography ? [lithography] : [],
            baseFrequency: baseFrequency ? [baseFrequency] : [],
          };
        } else {
          if (lithography) segments[segment]["lithography"].push(lithography);
          if (baseFrequency)
            segments[segment]["baseFrequency"].push(baseFrequency);
        }
      }
    });
    let labels = [];
    let avgLithoSize = {
      label: "Average Lithorgraphy Size",
      data: [],
      backgroundColor: "rgb(255, 99, 132)",
      stack: "Stack 0",
    };
    let avgBaseFrequency = {
      label: "Average Base Frequency",
      data: [],
      backgroundColor: "rgb(75, 192, 192)",
      stack: "Stack 1",
    };
    for (let segment in segments) {
      let avgLithSizeNum = calculateArrayAvg(segments[segment]["lithography"]);
      let avgBaseFrequencyNum = calculateArrayAvg(
        segments[segment]["baseFrequency"]
      );
      if (avgLithSizeNum > 0 && avgBaseFrequencyNum > 0) {
        labels.push(segment);
        avgLithoSize.data.push(avgLithSizeNum);
        avgBaseFrequency.data.push(avgBaseFrequencyNum);
      }
    }
    let result = {};
    result.labels = labels;
    result.datasets = [avgLithoSize, avgBaseFrequency];
    return result;
  };

  const renderBarChart = () => {
    let data = generateBarData(processors, totalRecords);
    const options = {
      plugins: {
        title: {
          display: true,
          text: "Average Frequency and Lithography Size from Processor Segments",
          font: {
            size: 18,
          },
        },
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "rect",
            pointStyleWidth: 30,
            boxHeight: 5,
            font: {
              size: 18,
            },
          },
        },
        colors: {
          enabled: true,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += `${context.parsed.y} ${
                  context?.dataset?.label.includes("Frequency") ? "GHz" : "nm"
                }`;
              }
              return label;
            },
          },
        },
      },
      scales: {
        y: {
          stacked: true,
          ticks: {
            stepSize: 10,
          },
        },
      },
      maintainAspectRatio: false,
    };
    return (
      <div className="barChart">
        <Bar data={data} options={options} width={"70%"} />
      </div>
    );
  };

  const generatePieData = (processors, totalRecords) => {
    const status = {};
    processors.forEach((data) => {
      let statusType = data?.Essentials?.["Status"];
      if (statusType) {
        if (!status[statusType]) status[statusType] = 1;
        else status[statusType]++;
      }
    });
    let labels = [];
    let count = 0;
    let datasets = {
      label: "Percentage",
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    };
    for (let label in status) {
      labels.push(label);
      datasets.data.push(((status[label] / totalRecords) * 100).toFixed(1));
      datasets.backgroundColor.push(
        BACKGROUND_COLOR[count % BACKGROUND_COLOR.length]
      );
      datasets.borderColor.push(BORDER_COLOR[count % BORDER_COLOR.length]);
      count++;
    }

    let result = { labels, datasets: [datasets] };

    return result;
  };

  const renderPieGraph = () => {
    let data = generatePieData(processors, totalRecords);
    const options = {
      plugins: {
        title: {
          display: true,
          text: "Processor Status",
          font: {
            size: 18,
          },
        },
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "rect",
            pointStyleWidth: 30,
            boxHeight: 5,
            font: {
              size: 18,
            },
          },
        },
        colors: {
          enabled: true,
        },
        datalabels: {
          color: "black",
          font: {
            size: 18,
            weight: "bold",
          },
          formatter: function (value, context) {
            return value + "%";
          },
        },
      },
      maintainAspectRatio: false,
    };

    return (
      <div className="pieChart">
        <Pie
          data={data}
          options={options}
          plugins={[ChartDataLabels]}
          width={"50%"}
        />
      </div>
    );
  };

  return (
    <div className="GraphPage">
      {renderBarChart()}
      {renderPieGraph()}
    </div>
  );
};

export default Graph;
