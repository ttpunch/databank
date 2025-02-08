import React from 'react';

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="bg-white bg-opacity-20 p-10 rounded-lg shadow-lg text-center">
        <h1 className="text-6xl font-bold mb-4">Welcome to the Page</h1>
        <p className="text-xl mb-8">This is a modern looking page with Tailwind CSS.</p>
        <button className="px-6 py-3 bg-blue-700 hover:bg-blue-800 rounded-full text-lg font-semibold">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Page;