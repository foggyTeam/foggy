import crypto from 'crypto';

export default function getHash(s: string): string {
  const hash = crypto.createHash('md5').update(s).digest('hex');

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
