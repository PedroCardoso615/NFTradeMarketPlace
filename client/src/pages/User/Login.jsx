import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/user/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Login Successful!", { position: "top-right" });
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        toast.error("Email or password is incorrect", { position: "top-right" });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong!", { position: "top-right" });
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      <p>
        <Link to="/forgot-password" style={{ color: "blue", textDecoration: "underline" }}>
          Forgot Password?
        </Link>
      </p>
    </div>
  );
};

export default Login;

