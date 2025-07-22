import { Box } from "@mui/material";

const UserEditPage = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: 2,
      }}
    >
      <h1>User Edit Page</h1>
      <p>Welcome to the user edit!</p>
      {/* Additional content can be added here */}
    </Box>
  );
};

export default UserEditPage;
