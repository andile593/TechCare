import { StaffRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        organizationId: string;
        role: StaffRole;
      };
    }
  }
}

export {};