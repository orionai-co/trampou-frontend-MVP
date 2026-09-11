import { TestBed } from '@angular/core/testing';
import { ShiftChatService } from '../../src/app/core/services/shift-chat.service';

describe('ShiftChatService', () => {
  let service: ShiftChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShiftChatService]
    });
    service = TestBed.inject(ShiftChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty active rooms before creation', () => {
    expect(service.rooms().length).toBe(0);
    expect(service.activeRoomsCount()).toBe(0);
  });

  it('should get or create an ephemeral room', () => {
    const initialCount = service.rooms().length;
    const room = service.getOrCreateRoom(
      'new-shift-100',
      'Auxiliar de Salão',
      'Restaurante Jardins',
      'Matheus Silva',
      'freelancer-1'
    );

    expect(room).toBeTruthy();
    expect(room.jobId).toBe('new-shift-100');
    expect(service.rooms().length).toBe(initialCount + 1);

    // Calling again should return the same active room without duplicates
    const sameRoom = service.getOrCreateRoom(
      'new-shift-100',
      'Auxiliar de Salão',
      'Restaurante Jardins',
      'Matheus Silva',
      'freelancer-1'
    );
    expect(sameRoom.id).toBe(room.id);
    expect(service.rooms().length).toBe(initialCount + 1);
  });

  it('should send a message and append to the room', () => {
    const room = service.getOrCreateRoom(
      'test-shift-msg',
      'Barman',
      'SkyBar',
      'Carlos Lima',
      'cand-carlos'
    );

    const initialMsgCount = room.messages.length;
    service.sendMessage(room.id, 'company', 'SkyBar', 'Chegue com 15 min de antecedência');

    const updatedRoom = service.getRoomById(room.id);
    expect(updatedRoom?.messages.length).toBe(initialMsgCount + 1);
    expect(updatedRoom?.messages[updatedRoom.messages.length - 1].text).toBe('Chegue com 15 min de antecedência');
  });

  it('should delete room on shift end leaving no residual chat', () => {
    const jobId = 'test-shift-to-delete';
    service.getOrCreateRoom(jobId, 'Cozinheiro', 'Bistrô', 'Pedro', 'p1');
    expect(service.isRoomActive(jobId)).toBeTrue();

    service.deleteRoomOnShiftEnd(jobId);
    expect(service.isRoomActive(jobId)).toBeFalse();
    expect(service.getRoomByJobId(jobId)).toBeUndefined();
  });
});
