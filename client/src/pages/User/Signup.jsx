import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { storage } from "../../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import styles from "../../styles/Signup.module.css";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Signup = () => {
  const [fullname, setFullname] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const fileInputClear = useRef(null);

  const validateForm = async () => {
    if (!fullname || !age || !email || !password || !profilePicture) {
      return "All fields are required.";
    }
    if (age < 18) {
      return "You must be at least 18 years old.";
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordPattern.test(password)) {
      return "Password must be at least 8 characters long, include one uppercase letter, two numbers, and one special character.";
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      return "Please enter a valid email address.";
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/user/check-email?email=${email}`
      );
      const data = await response.json();

      if (data.exists) {
        return "Email already exists.";
      }
    } catch (error) {
      console.error(error);
      return "Server error. Try again later.";
    }

    return "";
  };

  const handleSignUp = async () => {
    const errorMessage = await validateForm();

    if (errorMessage) {
      toast.error(errorMessage, { position: "top-right" });
      return;
    }

    setError("");

    try {
      const imageRef = ref(storage, `profilePictures/${profilePicture.name}`);
      await uploadBytes(imageRef, profilePicture);
      const imgUrl = await getDownloadURL(imageRef);

      const res = await fetch(`${API_BASE_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname,
          age,
          email,
          password,
          profilePicture: imgUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed.");

      setFullname("");
      setAge("");
      setEmail("");
      setPassword("");
      setProfilePicture(null);
      fileInputClear.current.value = "";

      toast.success("Signup Successful!", { position: "top-right" });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error(err.message || "Signup failed. Try again.", {
        position: "top-right",
      });
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h2 className={styles.title}>Sign Up</h2>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Full Name"
            className={styles.input}
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Age"
            className={styles.input}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
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

          <label htmlFor="file-upload" className={styles.uploadButton}>
            <CloudUploadIcon className={styles.cloudIcon} />
            <span>Upload Profile Picture</span>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              hidden
              ref={fileInputClear}
              onChange={(e) => setProfilePicture(e.target.files[0])}
            />
          </label>

          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSignUp}
          >
            Sign Up
          </button>
        </form>

        <p className={styles.linkText}>
          <Link to="/login" className={styles.linkWithIcon}>
            Already have an account
            <ArrowForwardIcon className={styles.icon} />
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
