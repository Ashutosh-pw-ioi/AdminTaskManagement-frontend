import LoginPage from "../../loginPage";

export const metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return <LoginPage role="admin" imagePath="/AdminLogin.png" />;
}
