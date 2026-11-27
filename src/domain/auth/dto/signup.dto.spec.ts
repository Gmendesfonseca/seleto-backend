import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SignUpDto } from './signup.dto';

const base = {
  username: 'jane',
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'test-password',
  phone: '+5511999999999',
};

const errorsFor = async (payload: object) =>
  (await validate(plainToInstance(SignUpDto, payload))).map((e) => e.property);

describe('SignUpDto validation', () => {
  it('accepts a person sign-up that only carries a cpf', async () => {
    expect(await errorsFor({ ...base, type: 'PERSON', cpf: '12345678901' })).toEqual([]);
  });

  it('accepts a company sign-up that only carries a cnpj', async () => {
    expect(await errorsFor({ ...base, type: 'COMPANY', cnpj: '12345678000199' })).toEqual([]);
  });

  it('rejects an unknown account type', async () => {
    expect(await errorsFor({ ...base, type: 'ADMIN', cpf: '12345678901' })).toEqual(['type']);
  });

  it('rejects a payload without a phone', async () => {
    const { phone: _phone, ...withoutPhone } = base;

    expect(await errorsFor({ ...withoutPhone, type: 'PERSON', cpf: '12345678901' })).toEqual([
      'phone',
    ]);
  });
});
