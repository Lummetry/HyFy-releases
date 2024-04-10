import axios from "axios";

export class BaseService {
    protected baseUrl: string;
    protected token: string | null;
    private headers: { [key: string]: string };

    constructor() {
        this.baseUrl = "__REACT_APP_API_URL__";
        this.token = localStorage.getItem("token");
        this.headers = {
            "Content-Type": "application/json",
            Authorization: this.token ? `Bearer ${this.token}` : "",
        };

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

    protected async get<T>(url: string): Promise<T> {
        const response = await axios.get(`${this.baseUrl}${url}`, {
            headers: this.headers,
        });

        if (response.status !== 200) {
            throw new Error(response.statusText);
        }

        return response.data as T;
    }

    protected async post<T>(url: string, data: FormData|object|string): Promise<T> {
        const isFormData = data instanceof FormData;
        if (isFormData) {
            this.headers["Content-Type"] = "multipart/form-data";
        }

        if (!isFormData) {
            data = JSON.stringify(data);
        }

        const response = await axios.post(`${this.baseUrl}${url}`, data, {
            headers: this.headers,
        });

        if (response.status !== 200) {
            throw new Error(response.statusText);
        }

        return response.data as T;
    }

    protected async put<T>(url: string, data: object): Promise<T> {
        const response = await axios.put(`${this.baseUrl}${url}`, data, {
            headers: this.headers,
        });

        if (response.status !== 200) {
            throw new Error(response.statusText);
        }

        return response.data as T;
    }

    protected async delete<T>(url: string): Promise<T> {
        const response = await axios.delete(`${this.baseUrl}${url}`, {
            headers: this.headers,
        });

        if (response.status !== 200) {
            throw new Error(response.statusText);
        }

        return response.data as T;
    }

    public setToken(token: string | null) {
        this.token = token;
        localStorage.setItem("token", token || "");
    }
}