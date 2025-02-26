"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ModalDrawer from "@/components/ui/modalDrawer";
import { useRouter } from "next/navigation";
import axios from 'axios'; // Add this line if not already present
import { DeleteData } from "@/actions/actions";
import { useToast } from "@/hooks/use-toast"
import { Upload, UploadIcon } from "lucide-react"
import Link from "next/link";



export default function Home() {
  const { toast } = useToast()
  const { data: session, status } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("machine"); // Default filter type
  const router = useRouter(); // Initialize router for navigation

  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        setLoading(true);
        try {
          const response = await axios.get(`/api/dataAddition`, { headers: { 'Cache-Control': 'no-store' } });
          console.log(response.data);
          setData(response.data);
        } catch (err) {
          console.error("Error fetching data:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [session]);

  if (status === "loading" || (loading && session)) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mb-4"></div>
      <p className="text-xl font-semibold">Loading your data...</p>
    </div>
  );

  if (!session) {
    return (
      <div className="text-center flex flex-col items-center justify-center h-screen bg-gray-900">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text animate-gradient">
          Welcome to Data Management Portal
        </h1>
        <p className="mb-6 text-gray-300 text-lg">Manage Areas, Machines, OEMs, and Parts.</p>
        <Button onClick={() => signIn()} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-md shadow-lg transition duration-300 hover:bg-gradient-to-l">
          Sign In
        </Button>
      </div>
    );
  }

  // Filter data based on search query and filter type
  const filteredData = data.filter(part => {
    const query = searchQuery.toLowerCase();
    if (filterType === "machine") {
      return part.machine.name.toLowerCase().includes(query);
    } else if (filterType === "oem") {
      return part.OEM.name.toLowerCase().includes(query);
    }
    return false;
  });

  const handleDelete = async (id: string) => {
    try {
        const response: any = await DeleteData(id);
        if (response) {
            toast({ title: "Success", description: response.message });
            // Update local state to remove the deleted item
            setData(prevData => prevData.filter(item => item._id !== id));
        } else {
            toast({ title: "Error", description: "Failed to delete data." });
        }
    } catch (error) {
        console.error("Error deleting data:", error);
        toast({ title: "Error", description: "An error occurred while deleting data." });
    }
};

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-6 scroll-smooth">
      <div className="w-full max-w-4xl mt-16 mb-8">
        <div>
          <h1 className="text-center text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text animate-gradient">Parts Inventory</h1>
          <div className="flex justify-between items-center mb-4">
            <ModalDrawer />
            <Button onClick={() => signOut({ callbackUrl: '/' })} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200">Sign Out</Button>
          </div>
        </div>
        <div className="flex mb-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-700 rounded-lg p-2 mr-2 bg-gray-800 text-white"
          >
            <option value="machine">Machine</option>
            <option value="oem">OEM</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-700 rounded-lg p-2 w-full text-white bg-gray-800"
          />
        </div>
        <div className="overflow-hidden shadow-lg rounded-lg">
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full bg-white/10 backdrop-blur-sm text-white">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-600 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-xs font-semibold text-white uppercase tracking-wider">Machine</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-xs font-semibold text-white uppercase tracking-wider">Machine No</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-xs font-semibold text-white uppercase tracking-wider">OEM</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-xs font-semibold text-white uppercase tracking-wider">Part No</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-xs font-semibold text-white uppercase tracking-wider">Part Detail</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-xs font-semibold text-white uppercase tracking-wider">Installed Qty</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-xs font-semibold text-white uppercase tracking-wider">Available Qty</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((part, index) => (
                    <tr key={`${part._id}-${index}`} className="hover:bg-gray-700/50 transition-colors duration-200">
                      <td className="py-3 px-4 border-b border-gray-700">{part.machine.name}</td>
                      <td className="py-3 px-4 border-b border-gray-700">{part.machine.machineNo}</td>
                      <td className="py-3 px-4 border-b border-gray-700">{part.OEM.name}</td>
                      <td className="py-3 px-4 border-b border-gray-700">{part.partNo}</td>
                      <td className="py-3 px-4 border-b border-gray-700">{part.partDetail}</td>
                      <td className="py-3 px-4 border-b border-gray-700">{part.installedQuantity}</td>
                      <td className="py-3 px-4 border-b border-gray-700">{part.availableQuantity}</td>
                      <td className="py-3 px-4 border-b border-gray-700">
                        <Button 
                          onClick={() => handleDelete(part._id)} 
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 px-4 text-center text-gray-400">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Upload link below the table */}
        <div className="mt-4 flex justify-start flex-col gap-6">
          <Button 
            onClick={() => router.push('/upload')} // Navigate to upload page
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition duration-200"
          >
          
             
             <UploadIcon className="w-4 h-4 mr-2" />Upload File
          </Button>
          <Button 
            onClick={() => router.push('/dashboard')} // Navigate to upload page
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-200"
          >
            Go to Dashboard
          </Button>

        </div>
      </div>
    </div>
  );
}