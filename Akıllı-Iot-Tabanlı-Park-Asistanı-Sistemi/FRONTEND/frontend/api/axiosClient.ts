import axios from 'axios';
import { getToken } from '../utils/secureStore';

interface AuthParams {
  isLoggedIn: boolean;
  token: string | null;
}

const LOCAL_IP = "192.168.153.198"; // ← kendi bilgisayar IP adresinle değiştir
const PORT = "8083";

// Axios client oluşturuluyor
export const axiosClient = axios.create({
  baseURL: `http://${LOCAL_IP}:${PORT}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export const setAuthorizationHeader = ({ isLoggedIn, token }: AuthParams) => {
  if (isLoggedIn) {
    const authorizationHeaderValue = `Bearer ${token}`;
    axiosClient.defaults.headers["Authorization"] = authorizationHeaderValue;
    console.log(axiosClient.defaults.headers["Authorization"]);
  } else {
    delete axiosClient.defaults.headers["Authorization"];
  }
};

export default axiosClient;
