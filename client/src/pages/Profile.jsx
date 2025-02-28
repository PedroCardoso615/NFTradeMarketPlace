import { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/user/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
        } else {
          setError("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!user) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h2>Welcome, {user.fullname}!</h2>
      <img
        src={user.profilePicture}
        alt="Profile"
        style={{ width: "150px", borderRadius: "50%" }}
      />
      <p><strong>Full Name:</strong> {user.fullname}</p>
      <p><strong>Age:</strong> {user.age}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
};

export default Profile;

