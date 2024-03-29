import React, { useState, useEffect } from 'react';
import axios from  'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, Colors, CategoryScale, LinearScale, BarElement, LineController, BarController, PointElement, LineElement} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie } from 'react-chartjs-2';
import './Graph.css';

ChartJS.register(ArcElement, Tooltip, Legend, Title, Colors, CategoryScale, LinearScale, BarElement, LineController, BarController, PointElement, LineElement);

const Graph = () => {
    const [loading, setLoading] = useState(false);
    const [processors, setProcessors] = useState(null);
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

    }

    const renderPieGraph = () => {
        let data = this.generatePieData(processors, totalRecords);
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
                <Pie data={data} options={options} plugins={[ChartDataLabels]}/>
            </div>
        )
    }
    
    return (
        <div>
            Graph page
        </div>
    );
};

export default Graph;