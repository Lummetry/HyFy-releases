import { createContext, ReactNode, useEffect, useState } from "react";
import { UserModel } from "../models/User";
import { AlertDialogProps } from "../components/AlertDialog";
import { UserService } from "../services/user.service";
import { LOCAL_STORAGE_LAST_KNOWN_TAB, LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_USER_KEY, LOCAL_STORAGE_USER_PREFERENCES } from "../Constants";

export interface UserPreferences {
  hideMenuDrawer: boolean;
  darkMode: boolean;
}

interface GlobalContextType {
  user: UserModel | null;
  isLoggedIn: boolean;
  snackBars?: SnackbarType[];
  updateUser: (user: UserModel | null) => void;
  logout: () => void;
  addSnackBar: (snackbar: SnackbarType) => void;
  getSnackBars: () => SnackbarType[];
  removeSnackBar: (id: number) => void;
  addAlertDialog: (dialog: AlertDialogProps) => void;
  getAlertDialogs: () => AlertDialogProps[];
  removeAlertDialog: (id: number) => void;
  getLastKnownSelectedTab: () => number;
  updateLastKnownSelectedTab: (tab: number) => void;
  getUserPreferences: () => UserPreferences;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
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

const defaultUserPreferences: UserPreferences = { hideMenuDrawer: false, darkMode: false };

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
  getUserPreferences: () => defaultUserPreferences,
  updateUserPreferences: () => {},
};

const GlobalContext = createContext<GlobalContextType>(globalContextDefaultValues);
const userService = new UserService();

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [user, setUser] = useState<UserModel | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [snackBars, setSnackBars] = useState<SnackbarType[]>([]);
  const [alertDialogs, setAlertDialogs] = useState<AlertDialogProps[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    const preferences = localStorage.getItem(LOCAL_STORAGE_USER_PREFERENCES);
    return preferences ? JSON.parse(preferences) : defaultUserPreferences;
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (token) {
        const isValid = await userService.validateToken(token);
        if (isValid.success) {
          const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (storedUser) {
            setUser({ ...JSON.parse(storedUser), token });
            setIsLoggedIn(true);
          } else if (isValid.profile) {
            setUser({ ...isValid.profile, token });
            setIsLoggedIn(true);
          }
        } else {
          logout();
        }
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, user.token || "");
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  }, [user, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USER_PREFERENCES, JSON.stringify(userPreferences));
  }, [userPreferences]);

  const updateUser = (user: UserModel | null) => {
    setUser(user);
    setIsLoggedIn(!!user);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const addSnackBar = (snackBar: SnackbarType) => {
    const id = Math.floor(Math.random() * 10000);
    setSnackBars([...snackBars, { ...snackBar, id, state: true }]);
  };

  const removeSnackBar = (id: number) => {
    setSnackBars(prevSnackBars => prevSnackBars.map(snack =>
      snack.id === id ? { ...snack, state: false } : snack
    ));
    setSnackBars(prevSnackBars => prevSnackBars.filter(snack => snack.id !== id));
  };

  const getSnackBars = () => snackBars;

  const addAlertDialog = (dialog: AlertDialogProps) => {
    const id = Math.floor(Math.random() * 10000);
    setAlertDialogs([...alertDialogs, { ...dialog, id, state: true }]);
  };

  const removeAlertDialog = (id: number) => {
    setAlertDialogs(prevDialogs => prevDialogs.map(dialog =>
      dialog.id === id ? { ...dialog, state: false } : dialog
    ));
  };

  const getAlertDialogs = () => alertDialogs;

  const getLastKnownSelectedTab = () => {
    const lastKnownTab = localStorage.getItem(LOCAL_STORAGE_LAST_KNOWN_TAB);
    return parseInt(lastKnownTab || "0", 10);
  };

  const updateLastKnownSelectedTab = (tab: number) => {
    localStorage.setItem(LOCAL_STORAGE_LAST_KNOWN_TAB, tab.toString());
  };

  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    setUserPreferences(prev => ({ ...prev, ...preferences }));
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
        getUserPreferences: () => userPreferences,
        updateUserPreferences,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
