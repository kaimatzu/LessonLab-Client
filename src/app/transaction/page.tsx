import React from 'react';
import TransactionLayout from './layout'
import TransactionResult from './(results)/transaction-result'

export default function Page() {
    return (
        <TransactionLayout>
          <TransactionResult />
        </TransactionLayout>
      );
}