import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type Item, type Finder, type Category, type ItemType } from '../backend';

export const ITEMS_QUERY_KEY = ['items'];
export const FINDERS_QUERY_KEY = ['finders'];

export function useGetAllItems() {
    const { actor, isFetching } = useActor();

    return useQuery<Item[]>({
        queryKey: ITEMS_QUERY_KEY,
        queryFn: async () => {
            if (!actor) return [];
            return actor.getAllItems();
        },
        enabled: !!actor && !isFetching,
    });
}

export function useGetItemsWithFinder() {
    const { actor, isFetching } = useActor();

    return useQuery<Item[]>({
        queryKey: [...ITEMS_QUERY_KEY, 'withFinder'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getItemsWithFinder();
        },
        enabled: !!actor && !isFetching,
    });
}

export function useGetFinders() {
    const { actor, isFetching } = useActor();

    return useQuery<Finder[]>({
        queryKey: FINDERS_QUERY_KEY,
        queryFn: async () => {
            if (!actor) return [];
            return actor.getFinders();
        },
        enabled: !!actor && !isFetching,
    });
}

/** Returns badge tier string based on credit score */
export function getFinderBadge(creditScore: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
    if (creditScore >= 100) return 'Platinum';
    if (creditScore >= 50) return 'Gold';
    if (creditScore >= 20) return 'Silver';
    return 'Bronze';
}

/** Map from finder contact → Finder */
export type FinderMap = Map<string, Finder>;

export interface AddItemPayload {
    id: string;
    title: string;
    description: string;
    category: Category;
    location: string;
    itemType: ItemType;
    contact: string;
}

export function useAddItem() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: AddItemPayload) => {
            if (!actor) throw new Error('Actor not initialized');
            await actor.addItem(
                payload.id,
                payload.title,
                payload.description,
                payload.category,
                payload.location,
                payload.itemType,
                payload.contact
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
        },
    });
}

export function useResolveItem() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            if (!actor) throw new Error('Actor not initialized');
            await actor.resolveItem(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
        },
    });
}

export interface SubmitClaimPayload {
    itemId: string;
    name: string;
    contact: string;
    clue1: string;
    clue2: string;
    clue3: string;
}

export function useSubmitClaim() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: SubmitClaimPayload) => {
            if (!actor) throw new Error('Actor not initialized');
            await actor.submitClaim(
                payload.itemId,
                payload.name,
                payload.contact,
                payload.clue1,
                payload.clue2,
                payload.clue3
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
        },
    });
}

export function useApproveClaim() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (claimId: string) => {
            if (!actor) throw new Error('Actor not initialized');
            await actor.approveClaim(claimId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: FINDERS_QUERY_KEY });
        },
    });
}

export function useRejectClaim() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (claimId: string) => {
            if (!actor) throw new Error('Actor not initialized');
            await actor.rejectClaim(claimId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
        },
    });
}
