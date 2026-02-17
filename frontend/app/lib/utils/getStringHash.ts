import crypto from 'crypto';

export default function getHash(s: string): string {
  const secret = process.env.STORAGE_SECRET;
  const hash = crypto.createHmac('sha256', secret).update(s).digest('hex');

  const num = BigInt(`0x${hash}`);

  const characters =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const base = characters.length;

  let encoded = '';
  let value = num;

  while (value > 0) {
    const remainder = Number(value % BigInt(base));
    encoded = characters[remainder] + encoded;
    value = value / BigInt(base);
  }

  return encoded || '0';
}

export function getRandomString(length: number = 32) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}
