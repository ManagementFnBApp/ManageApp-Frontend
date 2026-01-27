import { env } from 'next-runtime-env'


export const BASE_URL = (env('NEXT_PUBLIC_SERVER_API_URL') || process.env.NEXT_PUBLIC_SERVER_API_URL || '');