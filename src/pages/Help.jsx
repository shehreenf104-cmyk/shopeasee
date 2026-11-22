import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { getChatUsage, sendChatMessage } from "../services/api";

const greeting = {
  role: "assistant",
  text: "Hi! I’m the ShopEase assistant. Ask me about products, categories, your cart, checkout, or your account.",
};
const CHAT_STORAGE_KEY = "shopEaseHelpConversation";
const CHAT_SESSION_KEY = "shopEaseChatSession";
const CHAT_TOKEN_LIMIT = 1000;
const CHAT_LIMIT_MESSAGE =
  "Your tokens have run short. Please recharge or contact admin / try again later.";

function getChatSessionId() {
  let sessionId = sessionStorage.getItem(CHAT_SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(CHAT_SESSION_KEY, sessionId);
  }
  return sessionId;
}

function getSavedMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) ?? "null");
    if (
      Array.isArray(saved) &&
      saved.every(
        (message) =>
          message &&
          ["assistant", "user"].includes(message.role) &&
          typeof message.text === "string",
      )
    ) {
      return saved.length ? saved : [greeting];
    }
  } catch {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  }
  return [greeting];
}

export default function Help({ embedded = false }) {
  const [sessionId] = useState(getChatSessionId);
  const [messages, setMessages] = useState(getSavedMessages);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [loadingError, setLoadingError] = useState("");
  const bottomRef = useRef(null);
  const exhausted = tokensUsed >= CHAT_TOKEN_LIMIT;

  useEffect(() => {
    const controller = new AbortController();
    getChatUsage(sessionId, controller.signal)
      .then((usage) => setTokensUsed(usage.tokensUsed))
      .catch((error) => {
        if (error.name !== "AbortError") setLoadingError(error.message);
      });
    return () => controller.abort();
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = question.trim();
    if (!text || sending || exhausted) return;

    setQuestion("");
    setSending(true);
    setLoadingError("");
    setMessages((current) => [...current, { role: "user", text }]);

    try {
      const result = await sendChatMessage({ sessionId, message: text });
      setTokensUsed(result.tokensUsed);
      setMessages((current) => [
        ...current,
        { role: "assistant", text: result.reply },
      ]);
    } catch (error) {
      setLoadingError(error.message || "Unable to contact the ShopEase assistant.");
    } finally {
      setSending(false);
    }
  };

  const clearConversation = () => {
    setMessages([greeting]);
    setLoadingError("");
  };

  return (
    <Box
      sx={
        embedded
          ? { height: "100%", background: "white" }
          : {
              background: "#F1F5F9",
              minHeight: "calc(100vh - 68px)",
              py: { xs: 4, md: 6 },
            }
      }
    >
      <Container
        maxWidth={embedded ? false : "md"}
        disableGutters={embedded}
        sx={embedded ? { height: "100%" } : undefined}
      >
        {!embedded && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="overline"
              sx={{ color: "primary.main", letterSpacing: "0.12em" }}
            >
              SHOP EASE SUPPORT
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
              Help &amp; Chat
            </Typography>
            <Typography color="text.secondary">
              Ask about ShopEase products and how to use the store.
            </Typography>
          </Box>
        )}

        {loadingError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadingError}
          </Alert>
        )}

        <Card
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            ...(embedded && {
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }),
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2.5,
              py: embedded ? 1.25 : 2,
              background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              color: "white",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
                ...(embedded && { width: 36, height: 36 }),
              }}
            >
              <SmartToyIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography fontWeight={700}>ShopEase Assistant</Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.75)" }}
                aria-live="polite"
              >
                {tokensUsed}/{CHAT_TOKEN_LIMIT} tokens used
              </Typography>
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={Math.min((tokensUsed / CHAT_TOKEN_LIMIT) * 100, 100)}
            aria-label={`${tokensUsed} of ${CHAT_TOKEN_LIMIT} chatbot tokens used`}
          />

          <CardContent
            sx={{
              p: embedded ? 1 : { xs: 2, sm: 3 },
              ...(embedded && {
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
              }),
            }}
          >
            <Box
              aria-live="polite"
              sx={{
                height: embedded ? "auto" : { xs: 320, sm: 430 },
                ...(embedded && { flex: 1, minHeight: 56 }),
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                mb: 2,
                pr: 0.5,
              }}
            >
              {messages.map((message, index) => (
                <Box
                  key={`${message.role}-${index}`}
                  sx={{
                    alignSelf:
                      message.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    px: 2,
                    py: 1.25,
                    borderRadius: 2.5,
                    bgcolor:
                      message.role === "user" ? "primary.main" : "#F1F5F9",
                    color: message.role === "user" ? "white" : "text.primary",
                    whiteSpace: "pre-line",
                    overflowWrap: "anywhere",
                  }}
                >
                  <Typography variant="body2">{message.text}</Typography>
                </Box>
              ))}
              <Box ref={bottomRef} />
            </Box>

            {exhausted && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {CHAT_LIMIT_MESSAGE}
              </Alert>
            )}

            <Box component="form" onSubmit={sendMessage}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={
                    exhausted
                      ? "Chat token limit reached"
                      : "Ask a ShopEase question..."
                  }
                  disabled={exhausted || sending}
                  slotProps={{
                    htmlInput: {
                      maxLength: 300,
                      "aria-label": "Message the ShopEase assistant",
                    },
                  }}
                  size={embedded ? "small" : "medium"}
                />
                <IconButton
                  type="submit"
                  color="primary"
                  aria-label="Send message"
                  disabled={!question.trim() || sending || exhausted}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Stack>
              <Button
                size="small"
                onClick={clearConversation}
                sx={{ mt: embedded ? 0 : 1, textTransform: "none" }}
              >
                Clear conversation
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
