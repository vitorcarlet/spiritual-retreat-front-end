import { Box, Card } from "@mui/material"
import CardContent from "@mui/material/CardContent"

export const CustomCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card elevation={0} variant="outlined" sx={{ height: "100%" }}>
      <CardContent sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          color: `${color}.main`,
          backgroundColor: `${color}.lighter`,
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >{children}</Box>
      </CardContent>
      </Card>
      )
}