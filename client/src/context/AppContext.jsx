import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL


export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const navigate = useNavigate();
    const currency = import.meta.env.VITE_CURRENCY;

    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const isOwner = role === "owner";

    const [showLogin, setShowLogin] = useState(false);
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');

    const [cars, setCar] = useState([]);

    //Function to check if user is logged in
   const fetchUser = async () => {
  try {
    const { data } = await axios.get('/api/user/data');

    if (data.success) {
      setUser(data.user);
      setRole(data.user.role);
    } else {
      logout(); 
    }

  } catch (error) {
    logout(); 
  }
};

    //Function to fetch all cars from the server
    const fetchCars = async () => {
        try {
            const {data} = await axios.get('/api/user/cars')
            data.success ? setCar(data.cars) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Function to log out the user
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setToken(null);
        setUser(null);
        setRole(null);
        axios.defaults.headers.common['Authorization'] = '';
        toast.success('You have been logged out successfully.');
        navigate('/');
    }

    //useEffect to retrieve the token from localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        setToken(token);
        fetchCars();
    }, []);

    //useEffect to fetch user data when token is available
    useEffect(() => {
        if(token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();

        }
    }, [token]);

    const value = {
        navigate,
        currency,
        axios,
        cars,
        setCar,
        fetchCars,
        logout,
        fetchUser,
        token,
        setToken,
        user,
        setUser,
        role,
        setRole,
        isOwner,
        showLogin,
        setShowLogin,
        pickupDate,
        setPickupDate,
        returnDate,
        setReturnDate
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    return useContext(AppContext);
}