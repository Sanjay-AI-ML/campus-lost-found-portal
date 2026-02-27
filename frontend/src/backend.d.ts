import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Claim {
    id: string;
    itemId: string;
    contact: string;
    clue1: string;
    clue2: string;
    clue3: string;
    name: string;
    timestamp: Time;
}
export type Time = bigint;
export interface Item {
    id: string;
    status: Status;
    title: string;
    contact: string;
    description: string;
    timestamp: Time;
    itemType: ItemType;
    category: Category;
    location: string;
}
export interface Finder {
    contact: string;
    totalReturned: bigint;
    name: string;
    creditScore: bigint;
}
export enum Category {
    documents = "documents",
    clothing = "clothing",
    pets = "pets",
    jewelry = "jewelry",
    others = "others",
    electronics = "electronics"
}
export enum ItemType {
    found = "found",
    lost = "lost"
}
export enum Status {
    resolved = "resolved",
    active = "active",
    claim_pending = "claim_pending"
}
export interface backendInterface {
    addItem(id: string, title: string, description: string, category: Category, location: string, itemType: ItemType, contact: string): Promise<void>;
    approveClaim(claimId: string): Promise<void>;
    getActiveItems(): Promise<Array<Item>>;
    getAllClaims(): Promise<Array<Claim>>;
    getAllItems(): Promise<Array<Item>>;
    getClaimsByItem(itemId: string): Promise<Array<Claim>>;
    getFinders(): Promise<Array<Finder>>;
    getItemsWithFinder(): Promise<Array<Item>>;
    rejectClaim(claimId: string): Promise<void>;
    resolveItem(id: string): Promise<void>;
    submitClaim(itemId: string, name: string, contact: string, clue1: string, clue2: string, clue3: string): Promise<void>;
}
