"use server"

//make a fucntion to get the data
export async function getData() {
    const res = await fetch("https://cncdata-git-main-ttpunchs-projects.vercel.app/api/dataaddition");
    console.log(res)
    return res.json();
 
}

getData();