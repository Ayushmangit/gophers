import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";
import type { Conversation, Message } from "./messagingTypes";

interface ConversationsResponse {
  data: Conversation[];
}

interface MessagesResponse {
  data: Message[];
}

export const getConversations = createAsyncThunk<
  Conversation[],
  void,
  { rejectValue: string }
>("messaging/getConversations", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<ConversationsResponse>("/conversations/");

    return response.data.data ?? [];
  } catch {
    return rejectWithValue("Failed to load conversations");
  }
});

export const getConversationMessages = createAsyncThunk<
  Message[],
  number,
  { rejectValue: string }
>(
  "messaging/getConversationMessages",
  async (conversationID, { rejectWithValue }) => {
    try {
      const response = await axios.get<MessagesResponse>(
        `/conversations/${conversationID}/messages/`,
        {
          params: { limit: 50 },
        },
      );

      return response.data.data ?? [];
    } catch {
      return rejectWithValue("Failed to load messages");
    }
  },
);
