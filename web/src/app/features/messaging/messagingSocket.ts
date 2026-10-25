import axios from "../../api/axios";

interface TicketResponse {
  data: {
    ticket: string;
  };
}

export async function connectMessagingSocket(
  onMessage: (message: unknown) => void,
): Promise<WebSocket> {
  const response = await axios.post<TicketResponse>("/ws/ticket");
  const ticket = response.data.data.ticket;

  const baseURL = axios.defaults.baseURL;

  if (!baseURL) {
    throw new Error("API base URL is not configured");
  }

  const wsURL = new URL(axios.defaults.baseURL!);

  wsURL.protocol = wsURL.protocol === "https:" ? "wss:" : "ws:";
  wsURL.pathname = `${wsURL.pathname.replace(/\/$/, "")}/ws`;
  wsURL.search = new URLSearchParams({ ticket }).toString();

  const socket = new WebSocket(wsURL.toString());

  socket.addEventListener("message", (event) => {
    try {
      onMessage(JSON.parse(event.data));
    } catch (error) {
      console.error("Failed to parse WebSocket message", error);
    }
  });

  return socket;
}
