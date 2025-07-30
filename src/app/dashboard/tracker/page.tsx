
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, type Transaction } from '@/hooks/use-auth';
import { useTranslation } from '@/contexts/language-context';
import { ArrowLeft, PlusCircle, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { AddEditTransaction } from './_components/add-edit-transaction';
import { TransactionList } from './_components/transaction-list';
import Link from 'next/link';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useIsMobile } from '@/hooks/use-mobile';


export default function TrackerPage() {
  const { t } = useTranslation();
  const { transactions, addTransaction, updateTransaction, deleteTransaction, loading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const isMobile = useIsMobile();

  const handleAdd = () => {
    setEditingTransaction(null);
    setDialogOpen(true);
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  }

  const { totalIncome, totalExpense, netProfit } = useMemo(() => {
    const income = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      netProfit: income - expense,
    };
  }, [transactions]);
  
  const chartData = [
    { name: t('tracker.chart.income'), value: totalIncome, fill: "hsl(var(--primary))" },
    { name: t('tracker.chart.expense'), value: totalExpense, fill: "hsl(var(--destructive))" }
  ];


  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-headline">{t('tracker.title')}</h1>
          <p className="text-muted-foreground">{t('tracker.description')}</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4"/> {t('tracker.addTransaction')}
            </Button>
            <Button asChild variant="outline" className="shrink-0">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('profile.backToDashboard')}
                </Link>
            </Button>
        </div>
      </div>
      
      <AddEditTransaction 
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={async (data) => {
            if(editingTransaction) {
                await updateTransaction(editingTransaction.id, data);
            } else {
                await addTransaction(data);
            }
            setDialogOpen(false);
        }}
        transaction={editingTransaction}
      />

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('tracker.totalIncome')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{totalIncome.toLocaleString()}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('tracker.totalExpense')}</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{totalExpense.toLocaleString()}</div>
            </CardContent>
        </Card>
        <Card className={netProfit >= 0 ? "border-green-500/50" : "border-red-500/50"}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('tracker.netProfitLoss')}</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                    ₹{netProfit.toLocaleString()}
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
             <TransactionList 
                transactions={transactions} 
                onEdit={handleEdit}
                onDelete={deleteTransaction}
                loading={loading}
             />
        </div>
        <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle>{t('tracker.summaryChart')}</CardTitle>
                    <CardDescription>{t('tracker.summaryChartDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={chartData} layout={isMobile ? "vertical" : "horizontal"}>
                            {isMobile ? (
                                <>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                </>
                            ) : (
                                <>
                                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                </>
                            )}
                            <Tooltip
                                cursor={{fill: 'hsl(var(--muted))'}}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))"
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
