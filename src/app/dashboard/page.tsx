"use client"
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import axios from "axios";

const Dashboard = () => {
    const [machinesData, setMachinesData] = useState<{ areaName: string; totalMachines: number; }[]>([]);
    const [oemData, setOemData] = useState<{ areaName: string; OEMs: { name: string; totalInstalledQuantity: number; }[]; }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/dashboardEndPoint');
                
                // Transform area-wise machines data
                const transformedMachinesData = response.data.areaWiseMachines.map((areaData: { areaName: any; totalMachines: any; }) => ({
                    areaName: areaData.areaName,
                    totalMachines: areaData.totalMachines
                }));

                // Process and consolidate OEM data by area
                const consolidatedData = response.data.areaWiseOEMs.reduce((acc: { areaName: any; OEMs: any[]; }[], current: { areaName: any; OEMs: any[]; }) => {
                    const existingArea = acc.find(item => item.areaName === current.areaName);
                    
                    if (existingArea) {
                        // Merge OEM data for existing area
                        current.OEMs.forEach(oem => {
                            const existingOEM = existingArea.OEMs.find(e => e.name === oem.name);
                            if (existingOEM) {
                                existingOEM.totalInstalledQuantity += oem.totalInstalledQuantity;
                            } else {
                                existingArea.OEMs.push({ ...oem });
                            }
                        });
                    } else {
                        // Add new area with its OEMs
                        acc.push({
                            areaName: current.areaName,
                            OEMs: [...current.OEMs]
                        });
                    }
                    return acc;
                }, []);

                setMachinesData(transformedMachinesData);
                setOemData(consolidatedData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="text-center p-4">Loading...</div>;

    // Prepare data for OEM bar chart
    const oemBarChartData = oemData.map((area: { areaName: string; OEMs: { name: string; totalInstalledQuantity: number; }[]; }) => {
        const chartData: { [key: string]: number | string } = { areaName: area.areaName };
        area.OEMs.forEach(oem => {
            chartData[oem.name] = oem.totalInstalledQuantity;
        });
        return chartData;
    });

    // Prepare data for pie chart - total OEM quantities across all areas
    const pieChartData = oemData.reduce((acc: { name: string; value: number; }[], area) => {
        area.OEMs.forEach(oem => {
            const existingOEM = acc.find(item => item.name === oem.name);
            if (existingOEM) {
                existingOEM.value += oem.totalInstalledQuantity;
            } else {
                acc.push({
                    name: oem.name,
                    value: oem.totalInstalledQuantity
                });
            }
        });
        return acc;
    }, []);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6384"];

    // Get unique OEM names for bar chart
    const uniqueOEMs = Array.from(new Set(oemData.flatMap(area => 
        area.OEMs.map(oem => oem.name)
    )));

    return (
        <div className="p-4">
            {/* Machines by Area */}
            <h1 className="text-xl font-bold mb-4 text-center">Machines by Area</h1>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={machinesData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="areaName" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalMachines" fill="#8884d8" name="Total Machines" />
                </BarChart>
            </ResponsiveContainer>

            {/* Area-wise OEM Distribution */}
            <h1 className="text-xl font-bold mt-8 mb-4 text-center">OEM Distribution by Area</h1>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                    data={oemBarChartData} 
                    layout="vertical" 
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="areaName" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    {uniqueOEMs.map((oem, index) => (
                        <Bar 
                            key={oem} 
                            dataKey={oem} 
                            stackId="a"
                            fill={COLORS[index % COLORS.length]} 
                            name={oem}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>

            {/* Total OEM Distribution */}
            <h1 className="text-xl font-bold mt-8 mb-4 text-center">Total OEM Distribution</h1>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => 
                            `${name} (${(percent * 100).toFixed(1)}%)`
                        }
                    >
                        {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>

            {/* Summary Table */}
            <div className="mt-8">
                <h1 className="text-xl font-bold mb-4 text-center">Area-wise Summary</h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border">Area</th>
                                <th className="p-2 border">Total Machines</th>
                                <th className="p-2 border">OEM Details</th>
                                <th className="p-2 border">Total OEM Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machinesData.map((machine, index) => {
                                const areaOEMData = oemData.find((area: { areaName: string; OEMs: { name: string; totalInstalledQuantity: number; }[]; }) => area.areaName === machine.areaName);
                                return (
                                    <tr key={index}>
                                        <td className="p-2 border">{machine.areaName}</td>
                                        <td className="p-2 border text-right">{machine.totalMachines}</td>
                                        <td className="p-2 border">
                                            {areaOEMData?.OEMs.map(oem => 
                                                `${oem.name}: ${oem.totalInstalledQuantity}`
                                            ).join(', ') || 'No OEM data'}
                                        </td>
                                        <td className="p-2 border text-right">
                                            {areaOEMData?.OEMs.reduce((sum, oem) => 
                                                sum + oem.totalInstalledQuantity, 0
                                            ) || 0}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;