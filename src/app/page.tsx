"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import ModalDrawer from "@/components/ui/modalDrawer";

export default function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      axios.get("/api/dataAddition")
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => console.error("Error fetching data:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  if (status === "loading" || loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-6">
      {!session ? (
        <div className="text-center mt-16"> {/* Added margin from the top */}
          <h1 className="text-4xl font-bold mb-4">Welcome to CNC Management</h1>
          <p className="mb-6 text-gray-300">Manage your Areas, Machines, OEMs, and Parts.</p>
          <Button onClick={() => signIn()}>Sign In</Button>
        </div>
      ) : (
        <div className="w-full max-w-4xl mt-16 mb-8"> {/* Added margin from the top */}
          <div className="flex justify-between items-center mb-4 space-x-4">
            <h1 className="text-4xl font-bold">Parts List</h1>
            <ModalDrawer />
          </div>
          <table className="min-w-full bg-white text-gray-900">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Part No</th>
                <th className="py-2 px-4 border-b">Part Detail</th>
                <th className="py-2 px-4 border-b">Machine</th>
                <th className="py-2 px-4 border-b">OEM</th>
                <th className="py-2 px-4 border-b">Installed Quantity</th>
                <th className="py-2 px-4 border-b">Available Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((part) => (
                  <tr key={part._id}>
                    <td className="py-2 px-4 border-b">{part.partNo}</td>
                    <td className="py-2 px-4 border-b">{part.partDetail}</td>
                    <td className="py-2 px-4 border-b">{part.machine.name}</td>
                    <td className="py-2 px-4 border-b">{part.OEM.name}</td>
                    <td className="py-2 px-4 border-b">{part.installedQuantity}</td>
                    <td className="py-2 px-4 border-b">{part.availableQuantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-2 px-4 border-b text-center">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
