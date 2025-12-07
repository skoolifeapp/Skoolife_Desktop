import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, HelpCircle, Wallet } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

import { BudgetOnboarding } from '@/components/budget/BudgetOnboarding';
import { ConnectBankDialog } from '@/components/budget/ConnectBankDialog';
import { BudgetSummaryCards } from '@/components/budget/BudgetSummaryCards';
import { CategoryChart } from '@/components/budget/CategoryChart';
import { TransactionList } from '@/components/budget/TransactionList';
import { BudgetProgressSection } from '@/components/budget/BudgetProgressSection';
import { BudgetTutorialOverlay } from '@/components/budget/BudgetTutorialOverlay';

const BudgetPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    accounts, categories, transactions, budgets, settings, 
    loading, fetchData, updateTransactionCategory, updateBudget, updateSettings 
  } = useFinanceData();

  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!loading && accounts.length > 0 && settings && !settings.has_seen_finance_tutorial) {
      setShowTutorial(true);
    }
  }, [loading, accounts, settings]);

  const handleTutorialComplete = async () => {
    setShowTutorial(false);
    await updateSettings({ has_seen_finance_tutorial: true });
  };

  const handleConnectSuccess = () => {
    fetchData();
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: fr })
    };
  });

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <>
        <BudgetOnboarding 
          onComplete={fetchData}
          onConnectBank={() => setConnectDialogOpen(true)}
        />
        <ConnectBankDialog 
          open={connectDialogOpen}
          onOpenChange={setConnectDialogOpen}
          onSuccess={handleConnectSuccess}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-card/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Budget</h1>
              <p className="text-sm text-muted-foreground">Suis tes dépenses et ton reste à vivre</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => setShowTutorial(true)}>
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-6 space-y-6">
        <BudgetSummaryCards 
          transactions={transactions}
          selectedMonth={selectedMonth}
          monthlyIncomeEstimate={settings?.monthly_income_estimate}
        />

        <div className="grid lg:grid-cols-2 gap-6">
          <CategoryChart 
            transactions={transactions}
            categories={categories}
            selectedMonth={selectedMonth}
          />
          <BudgetProgressSection
            transactions={transactions}
            categories={categories}
            budgets={budgets}
            selectedMonth={selectedMonth}
            onUpdateBudget={async (catId, month, amount) => {
              await updateBudget(catId, month, amount);
            }}
          />
        </div>

        <TransactionList
          transactions={transactions}
          categories={categories}
          selectedMonth={selectedMonth}
          onUpdateCategory={async (id, catId) => {
            await updateTransactionCategory(id, catId);
          }}
        />
      </div>

      {showTutorial && (
        <BudgetTutorialOverlay onComplete={handleTutorialComplete} />
      )}

      <ConnectBankDialog 
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        onSuccess={handleConnectSuccess}
      />
    </div>
  );
};

export default BudgetPage;
