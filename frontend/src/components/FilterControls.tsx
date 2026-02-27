import { ItemType, Status } from '../backend';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Search, PackageSearch, CheckCircle2 } from 'lucide-react';

export type FilterOption = 'all' | 'lost' | 'found' | 'active';

interface FilterControlsProps {
    activeFilter: FilterOption;
    onChange: (filter: FilterOption) => void;
    counts: {
        all: number;
        lost: number;
        found: number;
        active: number;
    };
}

const FILTERS: { value: FilterOption; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All Items', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { value: 'lost', label: 'Lost', icon: <Search className="w-3.5 h-3.5" /> },
    { value: 'found', label: 'Found', icon: <PackageSearch className="w-3.5 h-3.5" /> },
    { value: 'active', label: 'Active Only', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
];

export function FilterControls({ activeFilter, onChange, counts }: FilterControlsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {FILTERS.map(filter => {
                const count = counts[filter.value];
                const isActive = activeFilter === filter.value;
                return (
                    <button
                        key={filter.value}
                        onClick={() => onChange(filter.value)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 border
                            ${isActive
                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40 hover:bg-accent'
                            }
                        `}
                    >
                        {filter.icon}
                        {filter.label}
                        <span
                            className={`ml-0.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-bold
                                ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}
                            `}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
