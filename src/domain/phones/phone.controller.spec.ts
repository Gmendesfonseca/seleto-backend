import { PhoneController } from './phone.controller';
import { PhoneServiceInterface } from './interfaces/phone.service.interface';
import { PhoneType } from './phone.model';

describe('PhoneController', () => {
  it('forwards the userId query as the owner filter', async () => {
    const service = { findAll: jest.fn().mockResolvedValue([]) };
    const controller = new PhoneController(service as unknown as PhoneServiceInterface);

    await controller.index('user-1', PhoneType.MOBILE, true);

    expect(service.findAll).toHaveBeenCalledWith({
      userId: 'user-1',
      type: PhoneType.MOBILE,
      isPrimary: true,
    });
  });
});
