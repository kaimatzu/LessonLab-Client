export interface User {
  userId: string;
  userType: 'STUDENT' | 'TEACHER';
  name: string;
  email: string;
  tokens: number;
}

export interface UserState {
  user: User | null;
  error: string | null;
  loading: boolean;
  isTransactionFinished: boolean;
  transactionStatus: string;
}
