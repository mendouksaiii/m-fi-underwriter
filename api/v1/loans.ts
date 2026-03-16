import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLoans } from '../_lib/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const limit = parseInt(req.query.limit as string) || 50;
    res.json(getLoans(limit));
}
