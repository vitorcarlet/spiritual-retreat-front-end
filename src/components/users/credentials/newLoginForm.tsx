import { useModal } from "@/src/hooks/useModal";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";

const newLoginForm = ({
  userLogin,
  setUserForModal,
}: {
  userLogin: string;
  setUserForModal: (data: UserCredentialsInfo) => void;
}) => {
  const modal = useModal();
  const [userLoginState, setUserLoginState] = useState(userLogin);
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h3">New Login Form</Typography>
      <TextField
        label="New Login"
        value={userLoginState}
        onChange={(e) => setUserLoginState(e.target.value)}
      />
      <Button
        onClick={() => {
          // Simulate API call to update login
          setUserForModal((prev: UserCredentialsInfo) => ({
            ...prev!,
            login: "new.login",
          }));
          modal.close();
        }}
      >
        Update Login
      </Button>
    </Box>
  );
};

export default newLoginForm;
