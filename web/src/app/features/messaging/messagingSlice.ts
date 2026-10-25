import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getConversations, getConversationMessages } from "./messagingThunk";
import type { Conversation, Message, MessagingState } from "./messagingTypes";

const initialState: MessagingState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  messagesLoading: false,
  error: null,
  messagesError: null,
};

const messagingSlice = createSlice({
  name: "messaging",
  initialState,
  reducers: {
    setActiveConversation: (
      state,
      action: PayloadAction<Conversation | null>,
    ) => {
      state.activeConversation = action.payload;
      state.messages = [];
      state.messagesError = null;
    },

    addIncomingMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;

      const conversation = state.conversations.find(
        (item) => item.id === message.conversation_id,
      );

      if (conversation) {
        conversation.updated_at = message.created_at;

        state.conversations = [
          conversation,
          ...state.conversations.filter(
            (item) => item.id !== message.conversation_id,
          ),
        ];
      }

      if (state.activeConversation?.id === message.conversation_id) {
        if (!state.messages.some((item) => item.id === message.id)) {
          state.messages.push(message);
        }
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load conversations";
      })
      .addCase(getConversationMessages.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(getConversationMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;

        const messagesById = new Map(
          state.messages.map((message) => [message.id, message]),
        );

        for (const message of action.payload) {
          messagesById.set(message.id, message);
        }

        state.messages = [...messagesById.values()].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      })
      .addCase(getConversationMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload ?? "Failed to load messages";
      });
  },
});

export const { setActiveConversation, addIncomingMessage } =
  messagingSlice.actions;

export default messagingSlice.reducer;
