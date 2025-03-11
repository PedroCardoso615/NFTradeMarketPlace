import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Avatar,
} from "@mui/material";
import NFToken from "../../images/NFToken.png";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/nft/transaction-history",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch transactions");
        }

        setTransactions(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (date) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    const formattedDate = new Date(date).toLocaleDateString("en-GB", options);
    return formattedDate;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h6" color="textSecondary" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold", mb: 4, mt: 4 }}
      >
        Transaction History
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 3,
        }}
      >
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <Card
              key={transaction._id}
              sx={{
                boxShadow: 3,
                "&:hover": { boxShadow: 6 },
                borderRadius: "8px",
              }}
            >
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  {formatDate(transaction.transactionDate)}
                </Typography>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ fontWeight: "bold" }}
                >
                  {transaction.nft?.NFTName || "Unknown NFT"}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  Price: {transaction.nft?.price}{" "}
                  <img
                    src={NFToken}
                    alt="NFToken"
                    style={{ width: 30, height: 30 }}
                  />
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Avatar
                    src={transaction.buyer?.profilePicture}
                    alt={transaction.buyer?.fullname || "Unknown Buyer"}
                    sx={{ width: 30, height: 30 }}
                  />
                  <Typography variant="body2">
                    {transaction.buyer?.fullname || "Unknown Buyer"}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    src={transaction.seller?.profilePicture}
                    alt={transaction.seller?.fullname || "Unknown Seller"}
                    sx={{ width: 30, height: 30 }}
                  />
                  <Typography variant="body2">
                    {transaction.seller?.fullname || "Unknown Seller"}
                  </Typography>
                </Box>
              </CardContent>

              <Box
                p={2}
                sx={{
                  textAlign: "center",
                  backgroundColor:
                    transaction.transactionStatus === "Completed"
                      ? "#4caf50"
                      : "#f44336",
                  color: "#fff",
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {transaction.transactionStatus || "Pending"}
                </Typography>
              </Box>
            </Card>
          ))
        ) : (
          <Box sx={{ width: "100%" }}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">No transactions found</Typography>
            </Paper>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default TransactionHistory;
