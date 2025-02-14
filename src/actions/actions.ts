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


