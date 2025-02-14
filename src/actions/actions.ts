"use server"
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/app/lib/db";
import Part from "@/app/modelNew/Part";


// Update the DeleteData function to perform a DELETE request with an id
export async function DeleteData(id: string) {
    await connectToDatabase();

    const res = await Part.deleteOne({ _id: id });
    console.log(res)

    // Check if the deletion was successful
    if (res.acknowledged===true) {
        revalidatePath("/");
        return { message: "Data deleted successfully" };
    } else {
        return { message: "Failed to delete data." };
    }
}

export async function UpdateData(id: string, data: any) {
    const res = await fetch(`https://cncdata-git-main-ttpunchs-projects.vercel.app/api/dataAddition/${id}`, {
        method: 'PUT', // Change to PUT method
        headers: {
            'Content-Type': 'application/json', // Set the content type if needed
        },
        body: JSON.stringify(data), // Stringify the data to send
    });
    console.log(res);
    return res.json();
}

export async function CreateData(data: any) {
    const res = await fetch(`https://cncdata-git-main-ttpunchs-projects.vercel.app/api/dataAddition`, {
        method: 'POST', // Change to PUT method
        headers: {
            'Content-Type': 'application/json', // Set the content type if needed
        },
        body: JSON.stringify(data), // Stringify the data to send
    });
    console.log(res);
    return res.json();
}
