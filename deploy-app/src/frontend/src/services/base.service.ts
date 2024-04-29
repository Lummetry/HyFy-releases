import axios from "axios"; // Import Axios library for making HTTP requests
import { LOCAL_STORAGE_TOKEN_KEY } from "../Constants";

/**
 * BaseService class provides a set of common methods for making HTTP requests.
 */
export class BaseService {
  /**
   * Base URL of the API (can be replaced with an environment variable or configuration).
   */
  protected baseUrl: string;
  /**
   * Token used for authentication (or null if not authenticated).
   */
  protected token: string | null;

  constructor() {
    this.baseUrl = "__REACT_APP_API_URL__"; // Set the base URL to a React environment variable
    // this.baseUrl = "http://localhost:8000/api"; // Alternatively, use a local development API URL
    this.token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) || null; // Get the token from local storage (or null if not set)

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // If the response status is 401 (Unauthorized)
          window.location.href = "/login"; // Redirect to the login page
        }
        return Promise.reject(error);
      }
    );
  }

  private get headers(): { [key: string]: string } {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY); // Get the current token from local storage
    return {
      "Content-Type": "application/json",
      Authorization: this.token ? `Bearer ${this.token || token}` : "",
    };
  }

  /**
   * Make a GET request to the specified URL with the current token.
   *
   * @param {string} url - The URL to make the GET request to.
   * @returns {Promise<T>} A promise that resolves to the response data as the requested type (T).
   */
  protected async get<T>(url: string): Promise<T> {
    const response = await axios.get(`${this.baseUrl}${url}`, {
      headers: this.headers,
    });

    return response.data as T;
  }

  /**
   * Make a POST request to the specified URL with the current token.
   *
   * @param {string} url - The URL to make the POST request to.
   * @param {FormData|object|string} data - The data to send in the request body.
   * @returns {Promise<T>} A promise that resolves to the response data as the requested type (T).
   */
  protected async post<T>(
    url: string,
    data: FormData | object | string
  ): Promise<T> {
    const headers = { ...this.headers };
    const isFormData = data instanceof FormData;
    if (isFormData) {
      headers["Content-Type"] = "multipart/form-data";
    }

    const response = await axios.post(`${this.baseUrl}${url}`, data, {
      headers,
    });

    return response.data as T;
  }

  /**
   * Make a PUT request to the specified URL with the current token.
   *
   * @param {string} url - The URL to make the PUT request to.
   * @param {object} data - The data to send in the request body.
   * @returns {Promise<T>} A promise that resolves to the response data as the requested type (T).
   */
  protected async put<T>(url: string, data: object): Promise<T> {
    const response = await axios.put(`${this.baseUrl}${url}`, data, {
      headers: this.headers,
    });

    return response.data as T;
  }

  /**
   * Make a DELETE request to the specified URL with the current token.
   *
   * @param {string} url - The URL to make the DELETE request to.
   * @returns {Promise<T>} A promise that resolves to the response data as the requested type (T).
   */
  protected async delete<T>(url: string): Promise<T> {
    const response = await axios.delete(`${this.baseUrl}${url}`, {
      headers: this.headers,
    });

    return response.data as T;
  }

  /**
   * Set the token for authentication.
   *
   * @param {string|null} token - The token to set.
   */
  public setToken(token: string | null) {
    this.token = token;
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token || "");
    // No need to explicitly update headers here as they are built dynamically
  }
}
