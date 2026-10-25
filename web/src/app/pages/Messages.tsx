import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Check,
  LoaderCircle,
  MessageCircle,
  Search,
  Send,
} from "lucide-react";

import type { AppDispatch, RootState } from "../store";
import {
  getConversations,
  getConversationMessages,
} from "../features/messaging/messagingThunk";
import {
  addIncomingMessage,
  setActiveConversation,
} from "../features/messaging/messagingSlice";
import { connectMessagingSocket } from "../features/messaging/messagingSocket";
import type {
  Conversation,
  Message,
} from "../features/messaging/messagingTypes";

function formatMessageTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatConversationTime(date: string) {
  const messageDate = new Date(date);
  const now = new Date();

  if (Number.isNaN(messageDate.getTime())) {
    return "";
  }

  if (messageDate.toDateString() === now.toDateString()) {
    return formatMessageTime(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export default function Messages() {
  const dispatch = useDispatch<AppDispatch>();

  const socketRef = useRef<WebSocket | null>(null);
  const [search, setSearch] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  const {
    conversations,
    activeConversation,
    messages,
    loading,
    messagesLoading,
    error,
    messagesError,
  } = useSelector((state: RootState) => state.messaging);

  const currentUserID = useSelector(
    (state: RootState) => state.auth.userData?.id,
  );

  useEffect(() => {
    void dispatch(getConversations());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    let socket: WebSocket | null = null;

    async function connect() {
      try {
        const connection = await connectMessagingSocket((payload) => {
          const message = payload as Message;

          if (
            typeof message.id === "number" &&
            typeof message.conversation_id === "number" &&
            typeof message.sender_id === "number" &&
            typeof message.content === "string" &&
            typeof message.created_at === "string"
          ) {
            dispatch(addIncomingMessage(message));
          }
        });

        if (cancelled) {
          connection.close();
          return;
        }

        socket = connection;
        socketRef.current = connection;

        connection.addEventListener("open", () => {
          setSocketConnected(true);
        });

        connection.addEventListener("close", () => {
          setSocketConnected(false);

          if (socketRef.current === connection) {
            socketRef.current = null;
          }
        });

        connection.addEventListener("error", () => {
          setSocketConnected(false);
        });
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to connect messaging WebSocket:", error);
        }
      }
    }

    void connect();

    return () => {
      cancelled = true;
      socket?.close();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [dispatch]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      conversation.other_user.username.toLowerCase().includes(query),
    );
  }, [conversations, search]);

  const latestMessageByConversation = useMemo(() => {
    const latest = new Map<number, Message>();

    for (const message of messages) {
      const existing = latest.get(message.conversation_id);

      if (
        !existing ||
        new Date(message.created_at).getTime() >
          new Date(existing.created_at).getTime()
      ) {
        latest.set(message.conversation_id, message);
      }
    }

    return latest;
  }, [messages]);

  function openConversation(conversation: Conversation) {
    dispatch(setActiveConversation(conversation));
    void dispatch(getConversationMessages(conversation.id));
  }

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = messageInput.trim();
    const conversation = activeConversation;
    const socket = socketRef.current;

    if (
      !content ||
      !conversation ||
      !socket ||
      socket.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    socket.send(
      JSON.stringify({
        conversation_id: conversation.id,
        content,
      }),
    );

    setMessageInput("");
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500">
            Gophers / Communication
          </p>

          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900">
            Messages
          </h1>

          <p className="mt-2 text-gray-500">
            Stay connected with your community.
          </p>
        </div>

        {/* Chat layout */}
        <div className="grid min-h-[650px] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm md:h-[min(720px,calc(100vh-220px))] md:grid-cols-[300px_minmax(0,1fr)]">
          {/* Conversation sidebar */}
          <aside
            className={`${
              activeConversation ? "hidden md:flex" : "flex"
            } min-h-0 flex-col border-r border-gray-100`}
          >
            <div className="border-b border-gray-100 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Conversations</h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {conversations.length}{" "}
                    {conversations.length === 1
                      ? "conversation"
                      : "conversations"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-100 p-2.5 text-gray-700">
                  <MessageCircle size={19} />
                </div>
              </div>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search people..."
                  aria-label="Search conversations"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {loading && (
                <div className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-gray-500">
                  <LoaderCircle size={17} className="animate-spin" />
                  Loading conversations...
                </div>
              )}

              {!loading && error && (
                <div className="m-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {!loading && !error && filteredConversations.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                    <MessageCircle size={22} />
                  </div>

                  <p className="text-sm font-medium text-gray-900">
                    {search.trim()
                      ? "No matching conversations"
                      : "No conversations yet"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {search.trim()
                      ? "Try searching for another username."
                      : "Your conversations will appear here."}
                  </p>
                </div>
              )}

              {!loading &&
                filteredConversations.map((conversation) => {
                  const isActive = activeConversation?.id === conversation.id;

                  const latestMessage = latestMessageByConversation.get(
                    conversation.id,
                  );

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => openConversation(conversation)}
                      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        isActive
                          ? "bg-gray-100 ring-1 ring-inset ring-gray-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                        {conversation.other_user.username
                          .charAt(0)
                          .toUpperCase()}

                        {isActive && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-gray-900" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-sm font-semibold ${
                              isActive ? "text-gray-900" : "text-gray-900"
                            }`}
                          >
                            {conversation.other_user.username}
                          </p>

                          <span className="shrink-0 text-[10px] text-gray-400">
                            {formatConversationTime(
                              latestMessage?.created_at ??
                                conversation.updated_at,
                            )}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          {latestMessage?.content ??
                            conversation.other_user.email}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>

            <div className="border-t border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    socketConnected ? "bg-green-500" : "bg-gray-400"
                  }`}
                />

                <span className="text-xs text-gray-500">
                  {socketConnected
                    ? "Real-time connection active"
                    : "Connecting to messages..."}
                </span>
              </div>
            </div>
          </aside>

          {/* Chat panel */}
          <section
            className={`${
              activeConversation ? "flex" : "hidden md:flex"
            } min-h-0 min-w-0 flex-col bg-white`}
          >
            {activeConversation ? (
              <>
                {/* Conversation header */}
                <header className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(setActiveConversation(null));
                    }}
                    aria-label="Back to conversations"
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 md:hidden"
                  >
                    <ArrowLeft size={19} />
                  </button>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                    {activeConversation.other_user.username
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold text-gray-900">
                      {activeConversation.other_user.username}
                    </h2>

                    <p className="truncate text-xs text-gray-500">
                      {activeConversation.other_user.email}
                    </p>
                  </div>

                  <div
                    className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium sm:flex ${
                      socketConnected
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        socketConnected ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    {socketConnected ? "Connected" : "Connecting"}
                  </div>
                </header>

                {/* Messages */}
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gray-50/70 px-4 py-5 sm:px-6">
                  {messagesLoading && messages.length === 0 && (
                    <div className="flex flex-1 items-center justify-center gap-2 text-sm text-gray-500">
                      <LoaderCircle size={18} className="animate-spin" />
                      Loading messages...
                    </div>
                  )}

                  {!messagesLoading && messagesError && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                      {messagesError}
                    </div>
                  )}

                  {!messagesLoading &&
                    !messagesError &&
                    messages.length === 0 && (
                      <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 shadow-sm">
                          <MessageCircle size={25} />
                        </div>

                        <h3 className="text-sm font-semibold text-gray-900">
                          Start the conversation
                        </h3>

                        <p className="mt-1 max-w-xs text-sm leading-6 text-gray-500">
                          Send a message to start connecting with{" "}
                          {activeConversation.other_user.username}.
                        </p>
                      </div>
                    )}

                  {messages.map((message, index) => {
                    const isOwnMessage =
                      currentUserID != null &&
                      message.sender_id === currentUserID;

                    const previousMessage = messages[index - 1];

                    const showTimestamp =
                      !previousMessage ||
                      new Date(message.created_at).getTime() -
                        new Date(previousMessage.created_at).getTime() >
                        5 * 60 * 1000;

                    return (
                      <div key={message.id}>
                        {showTimestamp && (
                          <div className="my-5 flex justify-center first:mt-0">
                            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-medium text-gray-500 shadow-sm">
                              {new Date(message.created_at).toLocaleDateString(
                                [],
                                {
                                  month: "short",
                                  day: "numeric",
                                  year:
                                    new Date(
                                      message.created_at,
                                    ).getFullYear() !== new Date().getFullYear()
                                      ? "numeric"
                                      : undefined,
                                },
                              )}
                            </span>
                          </div>
                        )}

                        <div
                          className={`mb-3 flex w-full ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] break-words sm:max-w-[75%] ${
                              isOwnMessage ? "items-end" : "items-start"
                            } flex flex-col`}
                          >
                            <div
                              className={`rounded-2xl px-4 py-3 shadow-sm ${
                                isOwnMessage
                                  ? "rounded-br-md border border-gray-900 bg-gray-900 text-white"
                                  : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                {message.content}
                              </p>
                            </div>

                            <div className="mt-1 flex items-center gap-1.5 px-1 text-[10px] text-gray-400">
                              <span>
                                {formatMessageTime(message.created_at)}
                              </span>

                              {isOwnMessage && (
                                <Check size={12} className="text-gray-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message composer */}
                <div className="border-t border-gray-100 bg-white p-3 sm:p-4">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2 transition focus-within:border-gray-400"
                  >
                    <textarea
                      value={messageInput}
                      onChange={(event) =>
                        setMessageInput(event.target.value.slice(0, 5000))
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey &&
                          !event.nativeEvent.isComposing
                        ) {
                          event.preventDefault();

                          if (messageInput.trim()) {
                            event.currentTarget.form?.requestSubmit();
                          }
                        }
                      }}
                      placeholder="Write a message..."
                      aria-label="Write a message"
                      rows={1}
                      className="max-h-32 min-h-10 min-w-0 flex-1 resize-y bg-transparent px-3 py-2.5 text-sm leading-5 text-gray-900 outline-none placeholder:text-gray-400"
                    />

                    <button
                      type="submit"
                      disabled={!messageInput.trim() || !socketConnected}
                      aria-label="Send message"
                      title={socketConnected ? "Send message" : "Connecting..."}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send size={17} />
                    </button>
                  </form>

                  <p className="mt-2 px-2 text-[10px] text-gray-400">
                    Enter to send · Shift + Enter for a new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm">
                  <MessageCircle size={29} strokeWidth={1.7} />
                </div>

                <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                  Your conversations, all in one place
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Select a conversation from the sidebar to view your messages
                  and continue chatting.
                </p>

                <div className="mt-5 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      socketConnected ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  {socketConnected
                    ? "Real-time messaging is ready"
                    : "Connecting to messaging"}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
