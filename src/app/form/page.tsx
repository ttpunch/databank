"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function AddDataForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    area: "",
    machine: "",
    machineNo: "",
    oem: "",
    partNo: "",
    partDetail: "",
    installedQuantity: "",
    availableQuantity: ""
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data?.user) setUser(data.user);
    }
    fetchUser();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/add-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      router.refresh();
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 min-h-screen flex items-center justify-center p-6">
      {user && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded-md shadow-lg">
          <p className="text-sm font-semibold text-gray-700">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      )}
      <Card className="max-w-3xl w-full p-8 shadow-2xl rounded-xl bg-white">
        <CardContent>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Add Data</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-700">Area</Label>
              <Select value={formData.area} onValueChange={(value) => handleChange("area", value)}>
                <SelectTrigger className="bg-gray-100 border-gray-300">
                  <SelectValue placeholder="Select Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EM-FBM-DABG">EM-FBM-DABG</SelectItem>
                  <SelectItem value="TURBINE">TURBINE</SelectItem>
                  <SelectItem value="NBS">NBS</SelectItem>
                  <SelectItem value="CNCLAB">CNCLAB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Machine</Label>
                <Input className="bg-gray-100" value={formData.machine} onChange={(e) => handleChange("machine", e.target.value)} />
              </div>
              <div>
                <Label className="text-gray-700">Machine No.</Label>
                <Input className="bg-gray-100" value={formData.machineNo} onChange={(e) => handleChange("machineNo", e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-gray-700">OEM</Label>
              <Input className="bg-gray-100" value={formData.oem} onChange={(e) => handleChange("oem", e.target.value)} />
            </div>
            <div>
              <Label className="text-gray-700">Part No.</Label>
              <Input className="bg-gray-100" value={formData.partNo} onChange={(e) => handleChange("partNo", e.target.value)} />
            </div>
            <div>
              <Label className="text-gray-700">Part Detail</Label>
              <Input className="bg-gray-100" value={formData.partDetail} onChange={(e) => handleChange("partDetail", e.target.value)} />
            </div>
            <div>
              <Label className="text-gray-700">Installed Quantity</Label>
              <Input className="bg-gray-100" value={formData.installedQuantity} onChange={(e) => handleChange("installedQuantity", e.target.value)} />
            </div>
            <div>
              <Label className="text-gray-700">Available Quantity</Label>
              <Input className="bg-gray-100" value={formData.availableQuantity} onChange={(e) => handleChange("availableQuantity", e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md shadow-md transition">Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
