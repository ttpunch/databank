"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      axios.get("/api/dataaddition")
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      {!session ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to CNC Management</h1>
          <p className="mb-6 text-gray-300">Manage your Areas, Machines, OEMs, and Parts.</p>
          <Button onClick={() => signIn()} className="bg-blue-500 hover:bg-blue-600">
            Login
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button onClick={() => signOut()} className="bg-red-500 hover:bg-red-600">Logout</Button>
          </div>

          <div className="space-y-6">
            {data ? (
              <>
                <Section title="Areas" items={data.areas} />
                <Section title="Machines" items={data.machines} />
                <Section title="OEMs" items={data.oems} />
                <Section title="Parts" items={data.parts} />
              </>
            ) : (
              <p className="text-gray-400">No data found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const Section = ({ title, items }: { title: string; items: any[] }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
    <h2 className="text-2xl font-semibold mb-3">{title}</h2>
    {items.length > 0 ? (
      <ul className="list-disc pl-5 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-gray-300">{JSON.stringify(item)}</li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-400">No {title.toLowerCase()} available.</p>
    )}
  </div>
);
