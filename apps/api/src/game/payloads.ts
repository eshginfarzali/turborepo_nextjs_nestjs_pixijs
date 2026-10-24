import type {
  JoinRoomPayload,
  MakeMovePayload,
  RoomPayload,
} from '@repo/shared';

const ROOM_ID = /^[A-Za-z0-9_-]{1,32}$/;
const MAX_NAME_LENGTH = 20;

export class InvalidPayloadError extends Error {}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function roomId(value: unknown): string {
  if (typeof value !== 'string' || !ROOM_ID.test(value)) {
    throw new InvalidPayloadError(
      'roomId must be 1-32 letters, digits, "-" or "_".',
    );
  }
  return value;
}

export function parseRoomPayload(payload: unknown): RoomPayload {
  if (!isObject(payload)) throw new InvalidPayloadError('Expected an object.');
  return { roomId: roomId(payload.roomId) };
}

export function parseJoinRoomPayload(payload: unknown): JoinRoomPayload {
  if (!isObject(payload)) throw new InvalidPayloadError('Expected an object.');
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (!name || name.length > MAX_NAME_LENGTH) {
    throw new InvalidPayloadError(
      `name must be 1-${MAX_NAME_LENGTH} characters.`,
    );
  }
  return { roomId: roomId(payload.roomId), name };
}

export function parseMakeMovePayload(payload: unknown): MakeMovePayload {
  if (!isObject(payload)) throw new InvalidPayloadError('Expected an object.');
  if (typeof payload.index !== 'number') {
    throw new InvalidPayloadError('index must be a number.');
  }
  return { roomId: roomId(payload.roomId), index: payload.index };
}
