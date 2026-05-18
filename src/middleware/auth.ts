import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  role: 'user' | 'editor' | 'admin';
  status: string;
  jti: string;
  iat?: number;
  exp?: number;
}

const JWT_EXPIRES_IN = '7d';

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, secret: string): string {
  return jwt.sign(payload, secret, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string, secret: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (decoded.status && decoded.status !== 'active') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function requireAuth(request: Request, secret: string): JwtPayload {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new AuthError('未登录', 401);
  }
  const payload = verifyToken(header.split(' ')[1], secret);
  if (!payload) {
    throw new AuthError('登录已过期，请重新登录', 401);
  }
  return payload;
}

export function requireRole(request: Request, roles: string[], secret: string): JwtPayload {
  const payload = requireAuth(request, secret);
  if (!roles.includes(payload.role)) {
    throw new AuthError('权限不足', 403);
  }
  return payload;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'AuthError';
  }
}