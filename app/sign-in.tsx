import Login from "@/components/auth/Login";
import useAuthStore from "@/hooks/store/authStore";

export default function LoginScreen() {
  const { login, loginWithSupabase } = useAuthStore();
  return <Login login={login} loginWithSupabase={loginWithSupabase}/>;
}
