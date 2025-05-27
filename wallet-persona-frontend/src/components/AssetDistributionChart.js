import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title
} from 'chart.js';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    Title
);

// Helper to generate distinct colors
const generateRandomColor = (index, total) => {
    const hue = Math.floor((index / total) * 360);
    return `hsl(${hue}, 70%, 60%)`;
};

const AssetDistributionChart = ({ tokens, nativeBalance }) => {
    if ((!tokens || tokens.length === 0) && (!nativeBalance || nativeBalance.usdValue === 0)) {
        return <p className="text-center text-muted">No asset data available for chart.</p>;
    }

    const chartLabels = [];
    const chartDataPoints = [];
    const backgroundColors = [];
    let excludedTokensCount = 0;
    let hasAssetsWithValue = false;

    let totalAssets = 0;
    if (nativeBalance && nativeBalance.usdValue > 0) {
        chartLabels.push(nativeBalance.native ? 'ETH (Native)' : 'Native Currency');
        chartDataPoints.push(nativeBalance.usdValue);
        totalAssets++;
        hasAssetsWithValue = true;
    } else if (nativeBalance && nativeBalance.usdValue === 0 && parseFloat(nativeBalance.native) > 0) {
        excludedTokensCount++;
    }

    if (tokens) {
        tokens.forEach(token => {
            if (token.usdValue > 0) {
                chartLabels.push(token.name || token.symbol || 'Unknown Token');
                chartDataPoints.push(token.usdValue);
                totalAssets++;
                hasAssetsWithValue = true;
            } else if (parseFloat(token.balance) > 0) {
                excludedTokensCount++;
            }
        });
    }

    for (let i = 0; i < chartDataPoints.length; i++) {
        backgroundColors.push(generateRandomColor(i, chartDataPoints.length));
    }

    if (!hasAssetsWithValue) {
        return (
            <div className="text-center">
                <p className="text-muted">No assets with a reportable USD value to display in the chart.</p>
                {excludedTokensCount > 0 && (
                    <p className="text-muted small">
                        ({excludedTokensCount} other token(s) with a balance were found but had a $0.00 USD value reported.)
                    </p>
                )}
            </div>
        );
    }

    const data = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Asset Value (USD)',
                data: chartDataPoints,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
                borderWidth: 1,
                hoverOffset: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#e0e0e0',
                    boxWidth: 15,
                    padding: 15,
                }
            },
            title: {
                display: true,
                text: 'Asset Distribution by USD Value',
                color: '#f0f0f0',
                font: {
                    size: 16
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                        }
                        const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                        const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(2) + '%' : '0%';
                        return `${label} (${percentage})`;
                    }
                }
            }
        },
        cutout: '60%',
    };

    return (
        <div style={{ height: '350px', width: '100%' }}>
            <Doughnut data={data} options={options} />
            {excludedTokensCount > 0 && chartDataPoints.length > 0 && (
                <p className="text-center text-muted small mt-2">
                    Note: {excludedTokensCount} other token(s) with a balance were found but are not shown in the chart due to a $0.00 USD value reported.
                </p>
            )}
        </div>
    );
};

export default AssetDistributionChart; 