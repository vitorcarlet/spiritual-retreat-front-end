import Iconify from "@/src/components/Iconify";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Box, Button } from "@mui/material";

type ContainerButtonsProps = {
  onView?: (familyId: UniqueIdentifier) => void;
  onEdit?: (familyId: UniqueIdentifier) => void;
  familyId: UniqueIdentifier;
};

function ContainerButtons({ onView, onEdit, familyId }: ContainerButtonsProps) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 2,
        pb: 1,
        borderRadius: "0 0 8px 8px",
        backgroundColor: "background.paper",
        display: "flex",
        alignContent: "center",
        justifyContent: "space-between",
      }}
    >
      <Button
        size="medium"
        variant="outlined"
        sx={{
          width: 100,
          backgroundColor: "primary.main",
          color: "white",
          borderColor: "primary.main",
          "&:hover": {
            backgroundColor: "primary.dark",
            borderColor: "primary.dark",
          },
        }}
        onClick={() => onView?.(familyId)}
      >
        <Iconify icon="icomoon-free:plus" />
      </Button>
      <Button
        sx={{ width: 100 }}
        size="medium"
        variant="outlined"
        onClick={() => onEdit?.(familyId)}
      >
        <Iconify icon="ic:baseline-mode-edit" />
      </Button>
    </Box>
  );
}

export default ContainerButtons;
