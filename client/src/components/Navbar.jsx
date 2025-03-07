import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Box,
  TextField,
  Avatar,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../images/LogoNoBG.png";

const Navbar = () => {
  const [menuAnchor, setMenuAnchor] = useState({
    catalogMenu: null,
    featuredMenu: null,
  });
  const [notificationMenu, setNotificationMenu] = useState(null);
  const [profileMenu, setProfileMenu] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userNotifications, setUserNotifications] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/user/me", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) setCurrentUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchNotifications = async () => {
        try {
          const response = await fetch("http://localhost:5000/notification", {
            credentials: "include",
          });
          const data = await response.json();
          if (data.success) setUserNotifications(data.data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        } finally {
          setNotificationLoading(false);
        }
      };
      fetchNotifications();
    }
  }, [currentUser]);

  const handleNotificationsRead = async () => {
    try {
      await fetch("http://localhost:5000/notification/read", {
        method: "PUT",
        credentials: "include",
      });
      setUserNotifications((prev) =>
        prev.map((noti) => ({ ...noti, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const unreadCount = userNotifications.filter((noti) => !noti.isRead).length;

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/user/logout", {
        method: "POST",
        credentials: "include",
      });
      setCurrentUser(null);
      localStorage.removeItem("authToken");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (userLoading) return <CircularProgress />;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/nft?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  return (
    <AppBar position="static" sx={{ bgcolor: "#545454", p: 1 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link to="/">
            <Box
              component="img"
              src={logo}
              alt="NFTrade Logo"
              sx={{ height: 50, width: 50 }}
            />
          </Link>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search NFTs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(e);
            }}
            sx={{ bgcolor: "#fff", borderRadius: 1 }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 3, color: "#fff" }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button
            color="inherit"
            onClick={(e) =>
              setMenuAnchor({ ...menuAnchor, catalogMenu: e.currentTarget })
            }
            endIcon={<KeyboardArrowDownIcon />}
          >
            Catalog
          </Button>
          <Menu
            anchorEl={menuAnchor.catalogMenu}
            open={Boolean(menuAnchor.catalogMenu)}
            onClose={() => setMenuAnchor({ ...menuAnchor, catalogMenu: null })}
          >
            <MenuItem component={Link} to="/nfts">
              All NFTs
            </MenuItem>
            <MenuItem component={Link} to="/create">
              Create Your Own
            </MenuItem>
          </Menu>
          <Button
            color="inherit"
            onClick={(e) =>
              setMenuAnchor({ ...menuAnchor, featuredMenu: e.currentTarget })
            }
            endIcon={<KeyboardArrowDownIcon />}
          >
            Featured
          </Button>
          <Menu
            anchorEl={menuAnchor.featuredMenu}
            open={Boolean(menuAnchor.featuredMenu)}
            onClose={() => setMenuAnchor({ ...menuAnchor, featuredMenu: null })}
          >
            <MenuItem component={Link} to="/trending">
              Trending NFTs
            </MenuItem>
            <MenuItem component={Link} to="/top-creators">
              Top Creators
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            color="inherit"
            onClick={(e) => setNotificationMenu(e.currentTarget)}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationMenu}
            open={Boolean(notificationMenu)}
            onClose={() => setNotificationMenu(null)}
            sx={{ maxHeight: 300, overflowY: "auto" }}
          >
            {notificationLoading ? (
              <MenuItem>
                <CircularProgress size={24} />
              </MenuItem>
            ) : userNotifications.length > 0 ? (
              [
                ...userNotifications
                
                  .map((noti) => (
                    <MenuItem key={noti._id}>{noti.message}</MenuItem>
                  )),
                <Divider key="divider" />,
                <MenuItem
                  key="mark-all"
                  onClick={handleNotificationsRead}
                  sx={{ fontWeight: "bold", textAlign: "center" }}
                >
                  Mark all as read
                </MenuItem>,
              ]
            ) : (
              <MenuItem>No notifications</MenuItem>
            )}
          </Menu>

          {currentUser ? (
            <>
              <IconButton
                color="inherit"
                onClick={(e) => setProfileMenu(e.currentTarget)}
              >
                <Avatar
                  src={currentUser.profilePicture}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
              <Menu
                anchorEl={profileMenu}
                open={Boolean(profileMenu)}
                onClose={() => setProfileMenu(null)}
              >
                <MenuItem component={Link} to="/profile">
                  Profile
                </MenuItem>
                <MenuItem component={Link} to="/my-collection">
                  My Collection
                </MenuItem>
                <MenuItem component={Link} to="/favorites">
                  Favorites
                </MenuItem>
                <MenuItem component={Link} to="/daily-rewards">
                  Daily Rewards
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
