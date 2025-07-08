import { Grid } from "@mui/material";
import LoginCodeForm from "./LoginCodeForm";
import Image from "next/image";
export default function LoginCodeContent() {
  //const theme = useTheme();

  return (
    <Grid container spacing={0} component="main" width={"100%"} height="100vh">
      <Grid
        size={{ xs: 12 }}
        sx={{
          backgroundColor: "background.default", // ← Use a cor padrão do tema
          position: "relative", // ← IMPORTANTE: Necessário para fill
        }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={4}
      >
        <Image
          src={"/images/background16-9.png"} // ← Renomeie o arquivo (sem dois pontos)
          alt="Background"
          fill // ← Nova API
          style={{ objectFit: "cover", zIndex: 1 }} // ← Use style
          priority // ← Para imagens importantes
        />
        <Grid size={{ xs: 12, md: 6 }} zIndex={2}>
          <LoginCodeForm />
        </Grid>
      </Grid>
    </Grid>
  );
}
