// Free, no-signup instant video room via Jitsi Meet — one room per vCard, deterministic from its id
// so the owner and any visitor who clicks "Video Call" land in the same room without any backend/signaling.
export const getVideoRoomUrl = (cardId) => `https://meet.jit.si/webcardai-meet-${cardId}`;
