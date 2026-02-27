import { useState } from 'react';
import { Category, ItemType } from '../backend';
import { useAddItem } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, PlusCircle, Search, PackageSearch } from 'lucide-react';

const CATEGORIES: { value: Category; label: string }[] = [
    { value: Category.electronics, label: 'Electronics' },
    { value: Category.clothing, label: 'Clothing' },
    { value: Category.documents, label: 'Documents / ID / Cards' },
    { value: Category.jewelry, label: 'Jewelry' },
    { value: Category.pets, label: 'Pets' },
    { value: Category.others, label: 'Other' },
];

interface FormState {
    title: string;
    description: string;
    category: Category | '';
    location: string;
    itemType: ItemType;
    contact: string;
}

const INITIAL_FORM: FormState = {
    title: '',
    description: '',
    category: '',
    location: '',
    itemType: ItemType.lost,
    contact: '',
};

interface ItemFormProps {
    onSuccess?: () => void;
}

export function ItemForm({ onSuccess }: ItemFormProps) {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const addItem = useAddItem();

    function validate(): boolean {
        const newErrors: Partial<Record<keyof FormState, string>> = {};
        if (!form.title.trim()) newErrors.title = 'Title is required';
        if (!form.description.trim()) newErrors.description = 'Description is required';
        if (!form.category) newErrors.category = 'Category is required';
        if (!form.location.trim()) newErrors.location = 'Location is required';
        if (!form.contact.trim()) newErrors.contact = 'Contact info is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function generateId(): string {
        return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        await addItem.mutateAsync({
            id: generateId(),
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category as Category,
            location: form.location.trim(),
            itemType: form.itemType,
            contact: form.contact.trim(),
        });

        setForm(INITIAL_FORM);
        setErrors({});
        onSuccess?.();
    }

    function handleChange(field: keyof FormState, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Item Type Toggle */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Item Type</Label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted">
                    <button
                        type="button"
                        onClick={() => handleChange('itemType', ItemType.lost)}
                        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            form.itemType === ItemType.lost
                                ? 'bg-card shadow-xs badge-lost'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Search className="w-4 h-4" />
                        I Lost Something
                    </button>
                    <button
                        type="button"
                        onClick={() => handleChange('itemType', ItemType.found)}
                        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            form.itemType === ItemType.found
                                ? 'bg-card shadow-xs badge-found'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <PackageSearch className="w-4 h-4" />
                        I Found Something
                    </button>
                </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-semibold">
                    Item Title <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="title"
                    placeholder="e.g. Blue Hydroflask Water Bottle"
                    value={form.title}
                    onChange={e => handleChange('title', e.target.value)}
                    className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-semibold">
                    Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                    id="description"
                    placeholder="Describe the item in detail — color, size, distinguishing features..."
                    value={form.description}
                    onChange={e => handleChange('description', e.target.value)}
                    className={`resize-none min-h-[80px] ${errors.description ? 'border-destructive' : ''}`}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            {/* Category + Location row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">
                        Category <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={form.category}
                        onValueChange={val => handleChange('category', val)}
                    >
                        <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-sm font-semibold">
                        Location <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="location"
                        placeholder="e.g. Library 2nd Floor, Room 204"
                        value={form.location}
                        onChange={e => handleChange('location', e.target.value)}
                        className={errors.location ? 'border-destructive' : ''}
                    />
                    {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
                </div>
            </div>

            {/* Contact */}
            <div className="space-y-1.5">
                <Label htmlFor="contact" className="text-sm font-semibold">
                    Contact Info <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="contact"
                    placeholder="Email, phone, or student ID"
                    value={form.contact}
                    onChange={e => handleChange('contact', e.target.value)}
                    className={errors.contact ? 'border-destructive' : ''}
                />
                {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={addItem.isPending}
                className="w-full font-semibold h-11 text-sm"
            >
                {addItem.isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Submit Report
                    </>
                )}
            </Button>

            {addItem.isError && (
                <p className="text-xs text-destructive text-center">
                    Failed to submit. Please try again.
                </p>
            )}
        </form>
    );
}
