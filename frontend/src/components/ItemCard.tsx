import { useState } from 'react';
import { type Item, ItemType, Status, Category } from '../backend';
import { useResolveItem, useApproveClaim, useRejectClaim, getFinderBadge } from '../hooks/useQueries';
import { ClaimModal } from './ClaimModal';
import { Button } from '@/components/ui/button';
import {
    MapPin,
    Phone,
    Clock,
    CheckCircle2,
    Loader2,
    Layers,
    FileSearch,
    ThumbsUp,
    ThumbsDown,
    Hourglass,
} from 'lucide-react';
import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';

const CATEGORY_LABELS: Record<Category, string> = {
    [Category.electronics]: 'Electronics',
    [Category.clothing]: 'Clothing',
    [Category.documents]: 'Documents',
    [Category.jewelry]: 'Jewelry',
    [Category.pets]: 'Pets',
    [Category.others]: 'Other',
};

function formatTimestamp(timestamp: bigint): string {
    const ms = Number(timestamp / BigInt(1_000_000));
    const date = new Date(ms);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

interface CreditBadgeProps {
    creditScore: number;
}

function CreditBadge({ creditScore }: CreditBadgeProps) {
    const tier = getFinderBadge(creditScore);

    const config = {
        Platinum: {
            emoji: '💎',
            label: 'Platinum',
            className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-700',
        },
        Gold: {
            emoji: '🥇',
            label: 'Gold',
            className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700',
        },
        Silver: {
            emoji: '🥈',
            label: 'Silver',
            className: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
        },
        Bronze: {
            emoji: '🥉',
            label: 'Bronze',
            className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-700',
        },
    };

    const { emoji, label, className } = config[tier];

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}
            title={`Finder Trust Score: ${creditScore} pts`}
        >
            <span>{emoji}</span>
            <span>{label} Finder</span>
            <span className="opacity-60">· {creditScore}pts</span>
        </span>
    );
}

interface ItemCardProps {
    item: Item;
    creditScore?: number;
}

export function ItemCard({ item, creditScore }: ItemCardProps) {
    const resolveItem = useResolveItem();
    const approveClaim = useApproveClaim();
    const rejectClaim = useRejectClaim();
    const [justResolved, setJustResolved] = useState(false);
    const [claimModalOpen, setClaimModalOpen] = useState(false);

    const { actor } = useActor();

    // Fetch claims for this item when it's in claim_pending state
    const { data: itemClaims = [] } = useQuery({
        queryKey: ['claims', item.id],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getClaimsByItem(item.id);
        },
        enabled: !!actor && item.status === Status.claim_pending,
    });

    const isResolved = item.status === Status.resolved;
    const isClaimPending = item.status === Status.claim_pending;
    const isLost = item.itemType === ItemType.lost;
    const isFound = item.itemType === ItemType.found;
    const isActive = item.status === Status.active;

    // Show credit badge for found items that have a credit score
    const showCreditBadge = isFound && creditScore !== undefined && creditScore >= 0;

    // Get the most recent claim for approve/reject actions
    const latestClaim = itemClaims.length > 0
        ? itemClaims.reduce((latest, claim) =>
            claim.timestamp > latest.timestamp ? claim : latest
          , itemClaims[0])
        : null;

    async function handleResolve() {
        await resolveItem.mutateAsync(item.id);
        setJustResolved(true);
    }

    async function handleApproveClaim() {
        if (!latestClaim) return;
        await approveClaim.mutateAsync(latestClaim.id);
    }

    async function handleRejectClaim() {
        if (!latestClaim) return;
        await rejectClaim.mutateAsync(latestClaim.id);
    }

    return (
        <>
            <article
                className={`relative flex flex-col bg-card rounded-xl border card-shadow transition-all duration-300 overflow-hidden group
                    ${isResolved ? 'opacity-60' : 'hover:card-shadow-hover hover:-translate-y-0.5'}
                `}
            >
                {/* Top accent bar */}
                <div
                    className={`h-1 w-full ${
                        isResolved
                            ? 'bg-muted'
                            : isClaimPending
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
                            : isLost
                            ? 'bg-gradient-to-r from-orange-400 to-red-400'
                            : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    }`}
                />

                <div className="p-5 flex flex-col gap-3 flex-1">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Lost/Found badge */}
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                                    ${isLost ? 'badge-lost' : 'badge-found'}
                                `}
                            >
                                {isLost ? '● Lost' : '● Found'}
                            </span>

                            {/* Status badges */}
                            {isResolved && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold badge-resolved">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Resolved
                                </span>
                            )}
                            {isClaimPending && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                    <Hourglass className="w-3 h-3" />
                                    Claim Under Review
                                </span>
                            )}
                        </div>

                        {/* Category chip */}
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md shrink-0">
                            <Layers className="w-3 h-3" />
                            {CATEGORY_LABELS[item.category]}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className={`font-display font-semibold text-lg leading-snug ${isResolved ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {item.description}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-border/60">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                            <span className="truncate">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="w-3.5 h-3.5 shrink-0 text-primary" />
                            <span className="truncate">{item.contact}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{formatTimestamp(item.timestamp)}</span>
                        </div>

                        {/* Credit score badge for found items */}
                        {showCreditBadge && (
                            <div className="mt-1">
                                <CreditBadge creditScore={creditScore!} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer actions */}
                {!isResolved && (
                    <div className="px-5 pb-4 flex flex-col gap-2">
                        {/* Lost items: Mark as Resolved */}
                        {isLost && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResolve}
                                disabled={resolveItem.isPending}
                                className="w-full text-xs font-semibold h-8 border-border hover:bg-accent"
                            >
                                {resolveItem.isPending ? (
                                    <>
                                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                        Resolving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-3 h-3 mr-1.5" />
                                        Mark as Resolved
                                    </>
                                )}
                            </Button>
                        )}

                        {/* Found items: claim workflow */}
                        {isFound && isActive && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setClaimModalOpen(true)}
                                className="w-full text-xs font-semibold h-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                            >
                                <FileSearch className="w-3 h-3 mr-1.5" />
                                Submit Claim
                            </Button>
                        )}

                        {/* Found items: claim pending — approve / reject */}
                        {isFound && isClaimPending && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleApproveClaim}
                                    disabled={approveClaim.isPending || rejectClaim.isPending || !latestClaim}
                                    className="flex-1 text-xs font-semibold h-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                                >
                                    {approveClaim.isPending ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <>
                                            <ThumbsUp className="w-3 h-3 mr-1.5" />
                                            Approve
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRejectClaim}
                                    disabled={approveClaim.isPending || rejectClaim.isPending || !latestClaim}
                                    className="flex-1 text-xs font-semibold h-8 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                                >
                                    {rejectClaim.isPending ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <>
                                            <ThumbsDown className="w-3 h-3 mr-1.5" />
                                            Reject
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Resolved overlay stamp */}
                {(isResolved || justResolved) && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="rotate-[-20deg] border-2 border-muted-foreground/20 rounded-lg px-3 py-1 opacity-20">
                            <span className="text-muted-foreground font-bold text-lg tracking-widest uppercase">
                                Resolved
                            </span>
                        </div>
                    </div>
                )}
            </article>

            {/* Claim Modal */}
            <ClaimModal
                itemId={item.id}
                itemTitle={item.title}
                open={claimModalOpen}
                onOpenChange={setClaimModalOpen}
            />
        </>
    );
}
