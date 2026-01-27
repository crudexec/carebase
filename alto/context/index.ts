import AuthProvider from "./AuthContext";
import { combineComponents } from "./combine";
import StateProvider from "./StateContext";

const providers = [StateProvider, AuthProvider];
export const AppContextProvider = combineComponents(...providers);
