import Register from "@/components/Register";
import useAuthStore from "@/hooks/store/authStore";

export default function RegisterScreen() {
  const { register } = useAuthStore();
  return <Register register={register}/>;
}
