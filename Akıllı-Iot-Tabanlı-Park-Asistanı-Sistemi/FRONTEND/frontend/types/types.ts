export type ParkingSpot = {
  id: number;
  name: string;
  barrierId: number;
  isAvailable: boolean;
  isBarrierOpen: boolean;
  floor: string;
  reservationId?: number; 
};

export interface UserProfile {
  name: string;
  surname: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface EmailForm {
  email: string;
  password: string;
  newEmail: string;
}

export interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
};
export type UserFormValues = {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
};
export type Reservation = {
  id: number;
  userId: number;
  parkingSpotId: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'waiting';
  createdAt: string;
  updatedAt: string;
  parkingSpot?: ParkingSpot;
  endTime?: string | null;
  startTime?: string | null;
};