import React, { useState, useEffect } from 'react';
import axios from  'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, Colors, CategoryScale, LinearScale, BarElement, LineController, BarController, PointElement, LineElement} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie } from 'react-chartjs-2';
import './Graph.css';

ChartJS.register(ArcElement, Tooltip, Legend, Title, Colors, CategoryScale, LinearScale, BarElement, LineController, BarController, PointElement, LineElement);

const BACKGROUND_COLOR = [
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)',
];

const BORDER_COLOR = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
];

const Graph = () => {
    const [loading, setLoading] = useState(false);
    const [processors, setProcessors] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try{
                await retrieveData();
            } catch(e) {
                console.log(e);
            }
            setLoading(false);
        }
        fetchData();
    }, [])

    const retrieveData = async () => {
        let result = await getProcessors();
        console.log("result: ", result);
        setProcessors(result.data);
        setTotalRecords(result.totalRecords);
    }

    const getProcessors = async (params) => {
        let result =  await axios.get('http://localhost:8000/processors');
        return result.data;
    }

    const generatePieData = (processors, totalRecords) => {
        console.log("processors: ", processors)
        const segment = {};
        processors.forEach(data => {
            let segmentType = data?.Essentials?.["Vertical Segment"];
            if (segmentType) {
                if (!segment[segmentType]) segment[segmentType] = 1;
                else segment[segmentType]++;
            }
        })
        console.log("segment: ", segment);
        let labels = [];
        let count = 0;
        let datasets = {
            label: "Percentage",
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
        }
        for (let label in segment) {
            labels.push(label);
            datasets.data.push(((segment[label] / totalRecords) * 100).toFixed(1));
            datasets.backgroundColor.push(BACKGROUND_COLOR[count % BACKGROUND_COLOR.length]);
            datasets.borderColor.push(BORDER_COLOR[count % BORDER_COLOR.length]);
            count++
        }

        let result = {labels, datasets: [datasets]};

        console.log("PIE data: ", result)

        return result;
    }

    const renderPieGraph = () => {
        let data = generatePieData(processors, totalRecords);
        const options = {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'rect',
                        pointStyleWidth: 30,
                        boxHeight: 5,
                        font: {
                            size: 18
                        }
                    }
                },
                colors: {
                    enabled: true,
                },
                datalabels: {
                    color: 'black',
                    font: {
                        size: 18,
                        weight: "bold"
                    },
                    formatter: function(value, context) {
                        return value + "%";
                    }
                }
            },
            maintainAspectRatio: false
        };

        return (
            <div className='pieChart'>
                <Pie data={data} options={options} plugins={[ChartDataLabels]} width={"50%"} />
            </div>
        )
    }
    
    return (
        <div className='GraphPage'>
            Graph page test
            {renderPieGraph()}
        </div>
    );
};

export default Graph;