import { Grid, Typography } from "@mui/material";
import { Iconify } from "../../Iconify";
import { memo } from "react";

const Header = ({ role }: { role: string }) => {
  return (
    <Grid
      size={12}
      display={"flex"}
      alignItems={"center"}
      height={72}
      gap={2}
      borderBottom={1}
      borderColor={"divider"}
    >
      <Iconify icon="solar:danger-triangle-bold-duotone" color="warning.main" />
      <Typography
        variant="h5"
        component="h1"
        sx={{
          color: "warning.main",
          textTransform: "capitalize",
        }}
      >
        Cargo: {role}
      </Typography>
    </Grid>
  );
};

export default memo(Header);
