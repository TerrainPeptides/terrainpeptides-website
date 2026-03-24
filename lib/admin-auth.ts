import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'terrain-admin-secret-key-change-in-production'
)

export async function verifyAdmin(request: Request): Promise<{ valid: boolean; payload?: { sub: string; email: string } }> {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false }
    }

    const token = authHeader.substring(7)
    
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    return {
      valid: true,
      payload: {
        sub: payload.sub as string,
        email: payload.email as string,
      },
    }
  } catch {
    return { valid: false }
  }
}
