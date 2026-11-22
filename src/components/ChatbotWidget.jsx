import { useState } from "react";
import {
  Dialog,
  Fab,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import Help from "../pages/Help";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Chat with ShopEase">
        <Fab
          color="primary"
          aria-label="Open ShopEase chatbot"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            right: { xs: 16, sm: 24 },
            bottom: { xs: 16, sm: 24 },
            zIndex: (theme) => theme.zIndex.modal - 1,
            boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
          }}
        >
          <SmartToyIcon />
        </Fab>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-label="ShopEase chatbot"
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              m: { xs: 1, sm: 3 },
              width: { xs: "calc(100% - 16px)", sm: "100%" },
              height: {
                xs: "calc(100dvh - 16px)",
                sm: "min(760px, calc(100dvh - 48px))",
              },
              maxHeight: {
                xs: "calc(100% - 16px)",
                sm: "min(760px, calc(100% - 48px))",
              },
              borderRadius: 3,
              display: "flex",
              overflow: "hidden",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            },
          },
        }}
      >
        <Fab
          size="small"
          color="default"
          aria-label="Close ShopEase chatbot"
          onClick={() => setOpen(false)}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1,
            bgcolor: "rgba(255,255,255,0.14)",
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.24)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </Fab>
        <Help embedded />
      </Dialog>
    </>
  );
}
