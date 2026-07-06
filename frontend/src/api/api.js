import axios from "axios";

/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
|
| All requests go through this instance.
| Easy to change the backend URL later.
|
*/

const api = axios.create({
    baseURL: "http://localhost:8000/api/v1",
    timeout: 60000,
    headers: {
        "Content-Type": "application/json",
    },
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
    (config) => {
        console.log(
            `%cAPI Request`,
            "color:#3b82f6;font-weight:bold",
            config.method?.toUpperCase(),
            config.url
        );

        return config;
    },
    (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
    (response) => response,

    (error) => {

        if (error.response) {

            console.error(
                "Backend Error:",
                error.response.status,
                error.response.data
            );

        } else if (error.request) {

            console.error(
                "Cannot connect to FastAPI server."
            );

        } else {

            console.error(error.message);

        }

        return Promise.reject(error);
    }
);

/*
|--------------------------------------------------------------------------
| Chat Endpoint
|--------------------------------------------------------------------------
*/

export async function askQuestion(question) {

    const response = await api.post("/chat", {
        query: question,
    });

    return response.data;
}

/*
|--------------------------------------------------------------------------
| Upload Endpoint
|--------------------------------------------------------------------------
*/

export async function uploadDocument(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
}

/*
|--------------------------------------------------------------------------
| Health Endpoint
|--------------------------------------------------------------------------
*/

export async function checkHealth() {

    const response = await api.get("/health");

    return response.data;
}

export default api;