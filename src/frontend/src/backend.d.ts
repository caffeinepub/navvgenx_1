import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    content: string;
    role: string;
    timestamp: bigint;
    category: string;
}
export interface Profile {
    age: bigint;
    interests: Array<string>;
    userId: Principal;
    createdAt: bigint;
    ageGroup: string;
}
export interface Reminder {
    id: bigint;
    title: string;
    active: boolean;
    createdAt: bigint;
    time: string;
}
export interface HealthEntry {
    bp: string;
    weight: number;
    waterIntake: number;
    steps: bigint;
    timestamp: bigint;
    sleepHours: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addHealthEntry(entry: HealthEntry): Promise<void>;
    addMessage(message: Message): Promise<void>;
    addReminder(title: string, time: string, createdAt: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearChatHistory(): Promise<void>;
    computeHealthScore(): Promise<bigint>;
    createOrUpdateProfile(age: bigint, ageGroup: string, interests: Array<string>, createdAt: bigint): Promise<void>;
    deleteReminder(reminderId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatHistory(): Promise<Array<Message>>;
    getHealthEntries(): Promise<Array<HealthEntry>>;
    getProfile(userId: Principal): Promise<Profile | null>;
    getReminders(): Promise<Array<Reminder>>;
    getUserProfile(userId: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    toggleReminder(reminderId: bigint): Promise<void>;
}
