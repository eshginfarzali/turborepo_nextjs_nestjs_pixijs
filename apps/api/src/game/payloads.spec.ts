import {
  InvalidPayloadError,
  parseJoinRoomPayload,
  parseMakeMovePayload,
} from './payloads';

describe('payload parsing', () => {
  it('trims names and accepts valid room ids', () => {
    expect(
      parseJoinRoomPayload({ roomId: 'room_1-A', name: '  Ann ' }),
    ).toEqual({ roomId: 'room_1-A', name: 'Ann' });
  });

  it.each([
    [null],
    [{ roomId: 'has space', name: 'Ann' }],
    [{ roomId: 'r', name: '   ' }],
    [{ roomId: 'r', name: 'x'.repeat(21) }],
    [{ roomId: 'x'.repeat(33), name: 'Ann' }],
  ])('rejects invalid join payload %j', (payload) => {
    expect(() => parseJoinRoomPayload(payload)).toThrow(InvalidPayloadError);
  });

  it('requires a numeric move index', () => {
    expect(() => parseMakeMovePayload({ roomId: 'r', index: '4' })).toThrow(
      InvalidPayloadError,
    );
    expect(parseMakeMovePayload({ roomId: 'r', index: 4 })).toEqual({
      roomId: 'r',
      index: 4,
    });
  });
});
