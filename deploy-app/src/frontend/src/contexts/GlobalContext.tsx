import { createContext, ReactNode, useEffect, useState } from "react";
import { UserModel } from "../models/User";
import { AlertDialogProps } from "../components/AlertDialog";
import { UserService } from "../services/user.service";
import { LOCAL_STORAGE_LAST_KNOWN_TAB, LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_USER_KEY } from "../Constants";

interface GlobalContextType {
  user: UserModel | null;
  isLoggedIn: boolean;
  snackBars?: any[];
  updateUser: (user: UserModel | null) => void;
  logout?: () => void;
  addSnackBar?: ({ message, type, duration }: SnackbarType) => void;
  getSnackBars?: () => SnackbarType[];
  removeSnackBar?: (id: number) => void;
  addAlertDialog?: ({ title, message, bullets }: AlertDialogProps) => void;
  getAlertDialogs?: () => AlertDialogProps[];
  removeAlertDialog?: (id: number) => void;
  getLastKnownSelectedTab?: () => number;
  updateLastKnownSelectedTab?: (tab: number) => void;
}

interface GlobalProviderProps {
  children: ReactNode;
}

interface SnackbarType {
  id?: number;
  message: string;
  type: string;
  duration: number;
  state?: boolean;
}

const globalContextDefaultValues: GlobalContextType = {
  user: null,
  isLoggedIn: false,
  snackBars: [],
  updateUser: () => {},
  logout: () => {},
  addSnackBar: () => {},
  getSnackBars: () => [],
  removeSnackBar: () => {},
  addAlertDialog: () => {},
  getAlertDialogs: () => [],
  removeAlertDialog: () => {},
  getLastKnownSelectedTab: () => 0,
  updateLastKnownSelectedTab: () => {},
};

const GlobalContext = createContext<GlobalContextType>(
  globalContextDefaultValues
);
const userService = new UserService();

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [user, setUser] = useState<UserModel | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [snackBars, setSnackBars] = useState<SnackbarType[]>([]);
  const [alertDialogs, setAlertDialogs] = useState<AlertDialogProps[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (token) {
        const isValid = await userService.validateToken(token);
        if (isValid.success) {
          const user = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (user) {
            setUser({ ...JSON.parse(user), token });
            setIsLoggedIn(true);
          } else {
            if (isValid.profile) {
              setUser({ ...isValid.profile, token });
              setIsLoggedIn(true);
            }
          }
        } else {
          logout(); // Clear the user and token if not valid
          return;
        }
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, user?.token || "");
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  }, [user, isLoggedIn]);

  // update user and isLoggedIn state
  const updateUser = (user: UserModel | null) => {
    setUser(user);
    setIsLoggedIn(!!user);
  };

  // logout user, clear user and isLoggedIn state
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);

    // clear local storage
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const addSnackBar = ({ message, type, duration }: SnackbarType) => {
    const id = Math.floor(Math.random() * 10000);
    const snackBar = { id, message, type, duration, state: true };
    setSnackBars([...snackBars, snackBar]);
  };

  const removeSnackBar = (id: number) => {
    // get current snack bar and update state to false
    const snack = snackBars.find((snack: SnackbarType) => snack.id === id);
    if (snack) {
      snack.state = false;
      setSnackBars([...snackBars]);
    }

    const updatedSnackBars = snackBars.filter((snack) => snack.id !== id);
    setSnackBars(updatedSnackBars);
  };

  const getSnackBars = () => {
    return snackBars;
  };

  const addAlertDialog = ({ title, message, bullets }: AlertDialogProps) => {
    const id = Math.floor(Math.random() * 10000);
    const alertDialog = { id, title, message, bullets, state: true };
    setAlertDialogs([...alertDialogs, alertDialog]);
  };

  const removeAlertDialog = (id: number) => {
    const updatedDialogs = alertDialogs.map((dialog) => {
      if (dialog.id === id) {
        return { ...dialog, state: false }; // Modify state to false to hide the dialog
      }
      return dialog;
    });
    setAlertDialogs(updatedDialogs);
  };

  const getAlertDialogs = () => {
    return alertDialogs;
  };

  const getLastKnownSelectedTab = () => {
    const lastKnownTab = localStorage.getItem(LOCAL_STORAGE_LAST_KNOWN_TAB);
    return parseInt(lastKnownTab || "0");
  };

  const updateLastKnownSelectedTab = (tab: number) => {
    localStorage.setItem(LOCAL_STORAGE_LAST_KNOWN_TAB, tab.toString());
  };

  return (
    <GlobalContext.Provider
      value={{
        user,
        isLoggedIn,
        updateUser,
        logout,
        addSnackBar,
        getSnackBars,
        removeSnackBar,
        addAlertDialog,
        removeAlertDialog,
        getAlertDialogs,
        getLastKnownSelectedTab,
        updateLastKnownSelectedTab,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
