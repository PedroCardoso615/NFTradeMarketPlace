import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { storage } from "../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";

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
        `http://localhost:5000/user/check-email?email=${email}`
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
      setError(errorMessage);
      return;
    }

    setError("");

    try {
      const imageRef = ref(storage, `profilePictures/${profilePicture.name}`);
      await uploadBytes(imageRef, profilePicture);
      const imgUrl = await getDownloadURL(imageRef);

      const res = await fetch("http://localhost:5000/user/signup", {
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
    <div className="signup-container">
      <h2>Sign Up</h2>

      {error && <p className="error-message">{error}</p>}

      <input
        type="text"
        placeholder="Full Name"
        value={fullname}
        onChange={(e) => setFullname(e.target.value)}
      />
      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputClear}
        onChange={(e) => setProfilePicture(e.target.files[0])}
      />
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
};

export default Signup;
