import { useState } from 'react';
import { useSubmitClaim } from '../hooks/useQueries';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, KeyRound } from 'lucide-react';

interface ClaimFormState {
    name: string;
    contact: string;
    clue1: string;
    clue2: string;
    clue3: string;
}

const INITIAL_FORM: ClaimFormState = {
    name: '',
    contact: '',
    clue1: '',
    clue2: '',
    clue3: '',
};

interface ClaimModalProps {
    itemId: string;
    itemTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClaimModal({ itemId, itemTitle, open, onOpenChange }: ClaimModalProps) {
    const [form, setForm] = useState<ClaimFormState>(INITIAL_FORM);
    const [errors, setErrors] = useState<Partial<ClaimFormState>>({});
    const submitClaim = useSubmitClaim();

    function validate(): boolean {
        const newErrors: Partial<ClaimFormState> = {};
        if (!form.name.trim()) newErrors.name = 'Your name is required';
        if (!form.contact.trim()) newErrors.contact = 'Contact info is required';
        if (!form.clue1.trim()) newErrors.clue1 = 'Clue 1 is required';
        if (!form.clue2.trim()) newErrors.clue2 = 'Clue 2 is required';
        if (!form.clue3.trim()) newErrors.clue3 = 'Clue 3 is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleChange(field: keyof ClaimFormState, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        await submitClaim.mutateAsync({
            itemId,
            name: form.name.trim(),
            contact: form.contact.trim(),
            clue1: form.clue1.trim(),
            clue2: form.clue2.trim(),
            clue3: form.clue3.trim(),
        });

        setForm(INITIAL_FORM);
        setErrors({});
        onOpenChange(false);
    }

    function handleOpenChange(open: boolean) {
        if (!open) {
            setForm(INITIAL_FORM);
            setErrors({});
        }
        onOpenChange(open);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-primary" />
                        Submit a Claim
                    </DialogTitle>
                    <DialogDescription>
                        Prove ownership of <span className="font-semibold text-foreground">"{itemTitle}"</span> by providing your details and three identifying clues about the item.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="claim-name" className="text-sm font-semibold">
                            Your Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="claim-name"
                            placeholder="Full name"
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                            className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    {/* Contact */}
                    <div className="space-y-1.5">
                        <Label htmlFor="claim-contact" className="text-sm font-semibold">
                            Contact Info <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="claim-contact"
                            placeholder="Email, phone, or student ID"
                            value={form.contact}
                            onChange={e => handleChange('contact', e.target.value)}
                            className={errors.contact ? 'border-destructive' : ''}
                        />
                        {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
                    </div>

                    {/* Clues section */}
                    <div className="rounded-xl bg-muted/60 border border-border/60 p-4 space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Identifying Clues
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Provide three specific details only the true owner would know (e.g. serial number, sticker, engraving, contents).
                        </p>

                        {/* Clue 1 */}
                        <div className="space-y-1.5">
                            <Label htmlFor="claim-clue1" className="text-sm font-semibold">
                                Clue 1 <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="claim-clue1"
                                placeholder="e.g. Has a red sticker on the back"
                                value={form.clue1}
                                onChange={e => handleChange('clue1', e.target.value)}
                                className={errors.clue1 ? 'border-destructive' : ''}
                            />
                            {errors.clue1 && <p className="text-xs text-destructive">{errors.clue1}</p>}
                        </div>

                        {/* Clue 2 */}
                        <div className="space-y-1.5">
                            <Label htmlFor="claim-clue2" className="text-sm font-semibold">
                                Clue 2 <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="claim-clue2"
                                placeholder="e.g. Serial number starts with XZ-4"
                                value={form.clue2}
                                onChange={e => handleChange('clue2', e.target.value)}
                                className={errors.clue2 ? 'border-destructive' : ''}
                            />
                            {errors.clue2 && <p className="text-xs text-destructive">{errors.clue2}</p>}
                        </div>

                        {/* Clue 3 */}
                        <div className="space-y-1.5">
                            <Label htmlFor="claim-clue3" className="text-sm font-semibold">
                                Clue 3 <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="claim-clue3"
                                placeholder="e.g. Name engraved on the bottom"
                                value={form.clue3}
                                onChange={e => handleChange('clue3', e.target.value)}
                                className={errors.clue3 ? 'border-destructive' : ''}
                            />
                            {errors.clue3 && <p className="text-xs text-destructive">{errors.clue3}</p>}
                        </div>
                    </div>

                    {submitClaim.isError && (
                        <p className="text-xs text-destructive text-center">
                            Failed to submit claim. Please try again.
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={submitClaim.isPending}
                        className="w-full font-semibold h-11 text-sm"
                    >
                        {submitClaim.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting Claim...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit Claim
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
