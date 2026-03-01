import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'math_ai_default_secret_key'
);

export async function signToken(payload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);
}

export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch {
        return null;
    }
}

export function getTokenFromRequest(request) {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/math_ai_token=([^;]+)/);
    return match ? match[1] : null;
}

export async function getUserFromRequest(request) {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    return verifyToken(token);
}
