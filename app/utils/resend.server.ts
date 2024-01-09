import { Resend } from 'resend';
import invariant from 'tiny-invariant';

invariant(process.env.RESEND_API_KEY, 'Missing RESEND_API_KEY.');

const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;
