import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "../../styles/Login.module.css";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Login Successful!", { position: "top-right" });
        setTimeout(() => {
          navigate("/profile");
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Email or password is incorrect", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong!", { position: "top-right" });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h2 className={styles.title}>Welcome Back to NFTrade</h2>
        <form onSubmit={handleLogin} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>

        <p className={styles.linkText}>
          <Link
            to="/forgot-password"
            className={styles.link}
          >
            Forgot Password?
          </Link>
        </p>

        <p className={styles.linkText}>
          <Link
            to="/signup"
            className={styles.linkWithIcon}
          >
            Create an Account
            <ArrowForwardIcon className={styles.icon} />
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
