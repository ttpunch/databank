"use client";
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/dashboardEndPoint'); // Fetch aggregated data
                const transformedData = response.data.map((areaData: { area: any; machines: any[]; }) => ({
                    area: areaData.area,
                    totalInstalledQuantity: areaData.machines.reduce((sum, machine) => sum + machine.installedQuantity, 0),
                    totalAvailableQuantity: areaData.machines.reduce((sum, machine) => sum + machine.availableQuantity, 0)
                }));
                setData(transformedData); // Set the data for the chart
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Dashboard</h1>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                    <XAxis dataKey="area" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalInstalledQuantity" fill="#8884d8" />
                    <Bar dataKey="totalAvailableQuantity" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Dashboard;