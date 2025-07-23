"use client";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";

const UserEditPage = () => {
  const [role, setRole] = useState<Roles | "">("");

  const handleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value as Roles);
  };
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        //padding: 2,
        pt: 0,
      }}
    >
      <Box>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "200px",

            //borderRadius: "12px",
            //marginBottom: "60px",
          }}
        >
          <Image
            src={"/images/background16-9.png"} // ← Renomeie o arquivo (sem dois pontos)
            alt="Background"
            fill // ← Nova API
            style={{ objectFit: "cover" }} // ← Use style
            priority // ← Para imagens importantes
            onLoad={() => console.log("✅ Imagem carregou com sucesso")}
            onError={(e) => console.error("❌ Erro ao carregar imagem:", e)}
          />
        </Box>
        <Box
          //component="img"
          //src="/path/to/profile-image.jpg" // Replace with actual image path
          //alt="Profile"
          sx={{
            position: "relative",
            // bottom: "25%",
            // left: "5%",
            transform: "translate(25%, -50%)",
            width: "200px",
            height: "200px",
            //height: "120px",
            borderRadius: "50%",
            border: "4px solid white",
            //objectFit: "cover",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            marginBottom: "-100px", // Ajuste para sobrepor o background
          }}
        >
          <Image
            src="https://fastly.picsum.photos/id/503/200/200.jpg?hmac=genECHjox9165KfYsOiMMCmN-zGqh9u-lnhqcFinsrU" // Replace with actual image path
            alt="Profile"
            fill
            style={{ objectFit: "fill", borderRadius: "50%" }} // Ensure the image is circular
            onLoad={() => console.log("✅ Imagem carregou com sucesso")}
            onError={(e) => console.error("❌ Erro ao carregar imagem:", e)}
          />
        </Box>
      </Box>
      <Box sx={{ padding: 3, paddingTop: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              placeholder="Enter your name"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="CPF"
              variant="outlined"
              placeholder="000.000.000-00"
              onChange={(e) => {
                // Remove all non-numeric characters
                const value = e.target.value.replace(/\D/g, "");

                // Apply CPF mask
                let maskedValue = value;
                if (value.length <= 11) {
                  maskedValue = value
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                }

                e.target.value = maskedValue;
              }}
              slotProps={{
                htmlInput: { maxLength: 14 }, // 000.000.000-00
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Birth Date"
              type="date"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="City"
              variant="outlined"
              placeholder="Enter your city"
            />
          </Grid>
          <Grid size={12}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="select-role-label">Role</InputLabel>
              <Select
                labelId="select-role"
                value={role}
                onChange={(e) => handleChange(e)}
                label="Role"
                sx={{ minWidth: 150, width: "100%" }}
              >
                <MenuItem key={1} value={"admin"}>
                  Administrador
                </MenuItem>
                <MenuItem key={2} value={"manager"}>
                  Gestor
                </MenuItem>
                <MenuItem key={3} value={"consultant"}>
                  Consultor
                </MenuItem>
                <MenuItem key={4} value={"participant"}>
                  Participante
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default UserEditPage;
