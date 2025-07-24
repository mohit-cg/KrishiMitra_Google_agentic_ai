
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowDownCircle, ArrowUpCircle, MoreHorizontal, Trash2, Edit, ListX } from "lucide-react";
import { format } from 'date-fns';
import { useTranslation } from '@/contexts/language-context';
import { Transaction } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export function TransactionList({ transactions, onEdit, onDelete, loading }: TransactionListProps) {
  const { t } = useTranslation();

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => b.date.toMillis() - a.date.toMillis());
  }, [transactions]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tracker.recentTransactions')}</CardTitle>
        <CardDescription>{t('tracker.recentTransactionsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] hidden sm:table-cell">{t('tracker.form.type')}</TableHead>
                        <TableHead>{t('tracker.form.description')}</TableHead>
                        <TableHead className="text-right">{t('tracker.form.amount')}</TableHead>
                        <TableHead className="hidden md:table-cell">{t('tracker.form.date')}</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {loading ? (
                       Array.from({length: 3}).map((_, i) => (
                           <TableRow key={i}>
                               <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                               <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                               <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                               <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
                               <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                           </TableRow>
                       ))
                   ) : sortedTransactions.length > 0 ? (
                    sortedTransactions.map(tx => (
                        <TableRow key={tx.id}>
                            <TableCell className="hidden sm:table-cell">
                                <div className="flex items-center gap-2">
                                {tx.type === 'income' ? 
                                    <ArrowUpCircle className="h-5 w-5 text-green-500" /> : 
                                    <ArrowDownCircle className="h-5 w-5 text-red-500" />
                                }
                                <span className="capitalize">{t(`tracker.form.${tx.type}`)}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{tx.description}</div>
                                <div className="text-sm text-muted-foreground">{t(`tracker.categories.${tx.category}`)}</div>
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                ₹{tx.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{format(tx.date.toDate(), 'PPP')}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(tx)}>
                                            <Edit className="mr-2 h-4 w-4" /> {t('tracker.actions.edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete(tx.id)} className="text-red-500 focus:text-red-500">
                                            <Trash2 className="mr-2 h-4 w-4" /> {t('tracker.actions.delete')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                   ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                           <ListX className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                           {t('tracker.noTransactions')}
                        </TableCell>
                    </TableRow>
                   )}
                </TableBody>
            </Table>
         </div>
      </CardContent>
    </Card>
  );
}
