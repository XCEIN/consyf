import {
  AuthState,
  fetchUserBySessionToken,
} from "@/lib/redux/slices/auth.slice";
import { RootState, useAppDispatch } from "@/lib/redux/store";
import { useSelector } from "react-redux";

interface UseAuthReturn extends AuthState {
  loadUserBySessionToken(token: string): void;
}
export default function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const error = useSelector((state: RootState) => state.auth.error);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const loading = useSelector((state: RootState) => state.auth.loading);
  const userCurrent = useSelector((state: RootState) => state.auth.userCurrent);
  return {
    error,
    isAuthenticated,
    loading,
    userCurrent,
    loadUserBySessionToken(token) {
      dispatch(fetchUserBySessionToken(token));
    },
  };
}
