
"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from '@/contexts/language-context';
import { Transaction } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const transactionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, "Category is required"),
  date: z.date(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface AddEditTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormValues) => void;
  transaction?: Transaction | null;
}

const expenseCategories = [
    "seeds", "fertilizers", "pesticides", "labor", "equipment", "fuel", "rent", "other"
];
const incomeCategories = [
    "cropSale", "subsidy", "other"
];

export function AddEditTransaction({ isOpen, onClose, onSubmit, transaction }: AddEditTransactionProps) {
  const { t } = useTranslation();
  
  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date(),
    }
  });

  const transactionType = watch('type');

  useEffect(() => {
    if (transaction) {
      reset({
        ...transaction,
        date: transaction.date.toDate(),
      });
    } else {
      reset({
        description: '',
        amount: 0,
        type: 'expense',
        category: '',
        date: new Date(),
      });
    }
  }, [transaction, reset, isOpen]);

  const categoryOptions = transactionType === 'income' ? incomeCategories : expenseCategories;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? t('tracker.editTransaction') : t('tracker.addTransaction')}</DialogTitle>
          <DialogDescription>{t('tracker.transactionDetails')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">{t('tracker.form.description')}</Label>
            <Input id="description" {...register('description')} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="amount">{t('tracker.form.amount')}</Label>
                <Input id="amount" type="number" {...register('amount')} />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
             <div className="space-y-2">
                <Label>{t('tracker.form.type')}</Label>
                <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('tracker.form.selectType')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="expense">{t('tracker.form.expense')}</SelectItem>
                            <SelectItem value="income">{t('tracker.form.income')}</SelectItem>
                        </SelectContent>
                        </Select>
                    )}
                />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>{t('tracker.form.category')}</Label>
                 <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('tracker.form.selectCategory')} />
                        </SelectTrigger>
                        <SelectContent>
                            {categoryOptions.map(cat => (
                                <SelectItem key={cat} value={cat}>{t(`tracker.categories.${cat}`)}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    )}
                />
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>
             <div className="space-y-2">
                <Label>{t('tracker.form.date')}</Label>
                 <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>{t('tracker.form.pickDate')}</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                    )}
                />
             </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>{t('tracker.form.cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t('profile.saving') : t('tracker.form.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
