import axios from "axios";

export const uploadCsv = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await axios.post("http://localhost:8000/upload-csv", formData);
    return res.data;
};

export const generateDashboard = async (query) => {
    const res = await axios.post("http://localhost:8000/generate-dashboard", {
        query,
    });
    return res.data;
};