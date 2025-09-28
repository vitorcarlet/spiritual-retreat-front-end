import Iconify from "@/src/components/Iconify";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { CloseButtonProps, ModalComponentProps } from "./types";

export const ModalComponent = ({
  size,
  scroll,
  verticalAlign,
  variant = "small",
  key,
  keepMounted,
  customRender,
  title,
  titleIcon,
  handleClose,
  modalClassName,
  customContentSx,
  closeButtonSx,
  isOpened,
}: ModalComponentProps) => {
  const isCompact = variant === "small";
  const contentHeight = isCompact ? 300 : "80vh";

  return (
    <Dialog
      key={key}
      keepMounted={keepMounted}
      maxWidth={size}
      fullWidth
      slotProps={{
        paper: {
          className: modalClassName,
          sx: { verticalAlign },
        },
      }}
      PaperProps={{}}
      scroll={scroll}
      open={isOpened}
      onClose={handleClose}
    >
      {title ? (
        <DialogTitle sx={{ display: "flex", alignItems: "center", pb: 1 }}>
          {title && (
            <>
              {titleIcon && <Iconify icon={titleIcon} size={3} mr={1} />}

              {title}
            </>
          )}

          <CloseButton handleClose={handleClose} />
        </DialogTitle>
      ) : (
        <CloseButton
          handleClose={handleClose}
          sx={closeButtonSx ?? { top: 20 }}
        />
      )}

      <DialogContent
        sx={{ p: 2, minHeight: contentHeight, ...customContentSx }}
      >
        {customRender && <> {customRender()}</>}
      </DialogContent>
    </Dialog>
  );
};

const CloseButton = ({ handleClose, sx, ...rest }: CloseButtonProps) => (
  <IconButton
    {...rest}
    size="large"
    onClick={handleClose}
    sx={{
      maxWidth: 50,
      position: "absolute",
      right: 20,
      zIndex: (theme) => theme.zIndex.modal + 1,
      ...sx,
    }}
  >
    <Iconify icon="ep:close-bold" size={2.2} color="text.secondary" />
  </IconButton>
);
