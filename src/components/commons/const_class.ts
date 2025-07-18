// src/styles/formComponents.js

const defaultBtn = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out";
const primaryBtn = "bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105";
const secondaryBtn = "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg border border-gray-300 transition-colors duration-200";

const defaultInput = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
const largeInput = "text-lg " + defaultInput;

const defaultLabel = "block text-sm font-medium text-slate-700";

const defaultForm = "mb-4";

export {
    defaultBtn,
    primaryBtn,
    secondaryBtn,
    defaultInput,
    largeInput,
    defaultLabel,
    defaultForm
};