import { type Item, ItemType } from '../backend';
import { type FinderMap } from '../hooks/useQueries';
import { ItemCard } from './ItemCard';
import { PackageSearch } from 'lucide-react';

interface ItemGridProps {
    items: Item[];
    isLoading: boolean;
    finderMap?: FinderMap;
}

function SkeletonCard() {
    return (
        <div className="bg-card rounded-xl border card-shadow overflow-hidden animate-pulse">
            <div className="h-1 bg-muted" />
            <div className="p-5 space-y-3">
                <div className="flex gap-2">
                    <div className="h-5 w-16 bg-muted rounded-full" />
                    <div className="h-5 w-20 bg-muted rounded-md ml-auto" />
                </div>
                <div className="h-6 w-3/4 bg-muted rounded" />
                <div className="space-y-1.5">
                    <div className="h-3.5 w-full bg-muted rounded" />
                    <div className="h-3.5 w-5/6 bg-muted rounded" />
                    <div className="h-3.5 w-4/6 bg-muted rounded" />
                </div>
                <div className="pt-2 border-t border-border/60 space-y-1.5">
                    <div className="h-3 w-2/3 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                    <div className="h-3 w-1/3 bg-muted rounded" />
                </div>
            </div>
            <div className="px-5 pb-4">
                <div className="h-8 w-full bg-muted rounded-lg" />
            </div>
        </div>
    );
}

export function ItemGrid({ items, isLoading, finderMap }: ItemGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <PackageSearch className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                    No items found
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    No items match your current filter. Try a different filter or be the first to report one!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {items.map(item => {
                const creditScore = item.itemType === ItemType.found && finderMap
                    ? finderMap.has(item.contact)
                        ? Number((finderMap.get(item.contact)!).creditScore)
                        : undefined
                    : undefined;

                return (
                    <ItemCard
                        key={item.id}
                        item={item}
                        creditScore={creditScore}
                    />
                );
            })}
        </div>
    );
}
