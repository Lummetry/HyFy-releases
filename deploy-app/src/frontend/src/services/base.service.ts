import axios from "axios";

export class BaseService {
    protected baseUrl: string;
    protected token: string | null;

    constructor() {
        this.baseUrl = "__REACT_APP_API_URL__";
        // this.baseUrl = "http://localhost:8000/api";
        this.token = localStorage.getItem("token");

        axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    // Redirect to the login page
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    private get headers(): { [key: string]: string } {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            Authorization: this.token ? `Bearer ${this.token || token}` : "",
        };
    }

    protected async get<T>(url: string): Promise<T> {
        const response = await axios.get(`${this.baseUrl}${url}`, {
            headers: this.headers,
        });

        return response.data as T;
    }

    protected async post<T>(url: string, data: FormData|object|string): Promise<T> {
        const headers = { ...this.headers };
        const isFormData = data instanceof FormData;
        if (isFormData) {
            headers["Content-Type"] = "multipart/form-data";
        }

        const response = await axios.post(`${this.baseUrl}${url}`, data, { headers });

        return response.data as T;
    }

    protected async put<T>(url: string, data: object): Promise<T> {
        const response = await axios.put(`${this.baseUrl}${url}`, data, {
            headers: this.headers,
        });

        return response.data as T;
    }

    protected async delete<T>(url: string): Promise<T> {
        const response = await axios.delete(`${this.baseUrl}${url}`, {
            headers: this.headers,
        });

        return response.data as T;
    }

    public setToken(token: string | null) {
        this.token = token;
        localStorage.setItem("token", token || "");
        // No need to explicitly update headers here as they are built dynamically
    }
}
