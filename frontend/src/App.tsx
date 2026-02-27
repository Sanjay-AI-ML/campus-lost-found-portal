import { useState, useMemo } from 'react';
import { type Item, ItemType, Status } from './backend';
import { useGetItemsWithFinder, useGetFinders, type FinderMap } from './hooks/useQueries';
import { ItemForm } from './components/ItemForm';
import { ItemGrid } from './components/ItemGrid';
import { FilterControls, type FilterOption } from './components/FilterControls';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Heart, Trophy } from 'lucide-react';

function Header({ onOpenForm }: { onOpenForm: () => void }) {
    return (
        <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-sm border-b border-border shadow-xs">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                {/* Logo + Title */}
                <div className="flex items-center gap-3">
                    <img
                        src="/assets/generated/campus-logo.dim_256x256.png"
                        alt="Campus Lost & Found"
                        className="w-9 h-9 rounded-lg object-cover"
                    />
                    <div className="hidden sm:block">
                        <h1 className="font-display font-bold text-lg leading-tight text-foreground">
                            Campus Lost &amp; Found
                        </h1>
                        <p className="text-xs text-muted-foreground leading-none">
                            Reuniting campus community
                        </p>
                    </div>
                    <h1 className="sm:hidden font-display font-bold text-base text-foreground">
                        Lost &amp; Found
                    </h1>
                </div>

                {/* CTA */}
                <Button onClick={onOpenForm} size="sm" className="font-semibold gap-1.5">
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Report Item</span>
                    <span className="sm:hidden">Report</span>
                </Button>
            </div>
        </header>
    );
}

function TrustScoreLegend() {
    return (
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground">
                <Trophy className="w-3.5 h-3.5 text-primary" />
                Finder Trust:
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-700 font-medium">
                🥉 Bronze <span className="opacity-60">0–19pts</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200 dark:border-slate-600 font-medium">
                🥈 Silver <span className="opacity-60">20–49pts</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700 font-medium">
                🥇 Gold <span className="opacity-60">50–99pts</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-700 font-medium">
                💎 Platinum <span className="opacity-60">100+pts</span>
            </span>
        </div>
    );
}

function Footer() {
    const year = new Date().getFullYear();
    const appId = encodeURIComponent(
        typeof window !== 'undefined' ? window.location.hostname : 'campus-lost-found'
    );

    return (
        <footer className="mt-16 border-t border-border bg-card/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <img
                            src="/assets/generated/campus-logo.dim_256x256.png"
                            alt=""
                            className="w-5 h-5 rounded opacity-60"
                        />
                        <span className="font-display font-semibold text-foreground">
                            Campus Lost &amp; Found Portal
                        </span>
                        <span>© {year}</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        Built with{' '}
                        <Heart className="w-3 h-3 fill-current text-primary inline" />{' '}
                        using{' '}
                        <a
                            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary hover:underline"
                        >
                            caffeine.ai
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default function App() {
    const [filter, setFilter] = useState<FilterOption>('all');
    const [formOpen, setFormOpen] = useState(false);

    const { data: items = [], isLoading: itemsLoading } = useGetItemsWithFinder();
    const { data: finders = [] } = useGetFinders();

    // Build a map from contact → Finder for O(1) lookup
    const finderMap = useMemo<FinderMap>(() => {
        const map: FinderMap = new Map();
        for (const finder of finders) {
            map.set(finder.contact, finder);
        }
        return map;
    }, [finders]);

    const isLoading = itemsLoading;

    const filteredItems = useMemo(() => {
        switch (filter) {
            case 'lost':
                return items.filter((item: Item) => item.itemType === ItemType.lost);
            case 'found':
                return items.filter((item: Item) => item.itemType === ItemType.found);
            case 'active':
                return items.filter((item: Item) => item.status === Status.active);
            default:
                return items;
        }
    }, [items, filter]);

    const counts = useMemo(() => ({
        all: items.length,
        lost: items.filter((i: Item) => i.itemType === ItemType.lost).length,
        found: items.filter((i: Item) => i.itemType === ItemType.found).length,
        active: items.filter((i: Item) => i.status === Status.active).length,
    }), [items]);

    function handleFormSuccess() {
        setFormOpen(false);
        toast.success('Item reported successfully!', {
            description: 'Your report has been added to the portal.',
        });
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header onOpenForm={() => setFormOpen(true)} />

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
                {/* Hero section */}
                <section className="mb-8">
                    <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent to-background border border-primary/20 p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex-1">
                                <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-1">
                                    Lost something on campus?
                                </h2>
                                <p className="text-muted-foreground text-sm sm:text-base">
                                    Browse reported items or submit a new report. Our community helps reunite lost items with their owners.
                                </p>
                            </div>
                            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                                <DialogTrigger asChild>
                                    <Button size="lg" className="font-semibold shrink-0 gap-2">
                                        <PlusCircle className="w-5 h-5" />
                                        Report an Item
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="font-display text-xl">
                                            Report a Lost or Found Item
                                        </DialogTitle>
                                        <DialogDescription>
                                            Fill in the details below. Your report will be visible to the entire campus community.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Separator />
                                    <ItemForm onSuccess={handleFormSuccess} />
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Stats row */}
                        {!isLoading && items.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-4">
                                <div className="flex items-center gap-1.5 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                                    <span className="font-semibold text-foreground">{counts.lost}</span>
                                    <span className="text-muted-foreground">lost</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                                    <span className="font-semibold text-foreground">{counts.found}</span>
                                    <span className="text-muted-foreground">found</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block" />
                                    <span className="font-semibold text-foreground">{items.length - counts.active}</span>
                                    <span className="text-muted-foreground">resolved</span>
                                </div>
                                {finders.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                                        <span className="font-semibold text-foreground">{finders.length}</span>
                                        <span className="text-muted-foreground">trusted finders</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Items section */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                            <h2 className="font-display font-semibold text-xl text-foreground">
                                Browse Reports
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isLoading ? 'Loading...' : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} shown`}
                            </p>
                        </div>
                        <FilterControls
                            activeFilter={filter}
                            onChange={setFilter}
                            counts={counts}
                        />
                    </div>

                    {/* Trust score legend */}
                    <div className="mb-5">
                        <TrustScoreLegend />
                    </div>

                    <ItemGrid items={filteredItems} isLoading={isLoading} finderMap={finderMap} />
                </section>
            </main>

            <Footer />
            <Toaster richColors position="bottom-right" />
        </div>
    );
}
