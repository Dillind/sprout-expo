import { Tables } from '@/src/types/db';

export type UserPayloadDto = Tables<'users'> & {
    email: string;
};
