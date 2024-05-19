import React, { useMemo, useEffect, useState } from 'react';

import { currencyFilter, pluralize } from '../util';
import { CategoriesChart } from '.';
import { TransactionType } from './types';

interface Props {
  transactions: TransactionType[];
  numOfItems: number;
}

interface Categories {
  [key: string]: number;
}

export default function SpendingInsights(props: Props) {
  // grab transactions from most recent month and filter out transfers and payments
  const transactions = props.transactions;
  const monthlyTransactions = useMemo(
    () =>
      transactions.filter(tx => {
        const date = new Date(tx.date);
        const today = new Date();
        const oneMonthAgo = new Date(new Date().setDate(today.getDate() - 30));
        return (
          date > oneMonthAgo &&
          tx.category !== 'Payment' &&
          tx.category !== 'Transfer' &&
          tx.category !== 'Interest'
        );
      }),
    [transactions]
  );

  // create category and name objects from transactions

  const categoriesObject = useMemo((): Categories => {
    return monthlyTransactions.reduce((obj: Categories, tx) => {
      tx.category in obj
        ? (obj[tx.category] = tx.amount + obj[tx.category])
        : (obj[tx.category] = tx.amount);
      return obj;
    }, {});
  }, [monthlyTransactions]);


  const [fetchedData, setFetchedData] = useState(null);
  const [personalExpenses, setPersonalExpenses] = useState("loading...");

  useEffect(() => {
    const fetchData = async () => {
      const reducedTransactions = monthlyTransactions.slice(0, 2);
      console.log(`Categorize these expenses into "Business" or "Personal". The transactions are ${reducedTransactions.map(tx => `${tx.amount} ${tx.name}`).join(' END | START ')}. Expected output: a list of {Transaction name: Personal or Business}. Output: `);
      const response = await fetch('https://api.runpod.ai/v2/tdmt8s9x4q81uh/runsync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer <insert>'
        },
        body: JSON.stringify({
          'input': {
            'prompt': `Categorize this expense into 'Business' or 'Personal'. The transactions are ${reducedTransactions.map(tx => `${tx.amount} ${tx.name}`).join(' END | START ')}. Return a single word: 'Business' or 'Personal'.`,
          }
        })
      });
      const data = await response.json();
      console.log("HELLLLLLLLLLLLO after response");
      console.log(data);
      setFetchedData(data.id);
      setPersonalExpenses(data.id);
    };
  
    fetchData();
  }, []);
  
  
  const namesObject = useMemo((): Categories => {
    return monthlyTransactions.reduce((obj: Categories, tx) => {
      tx.name in obj
        ? (obj[tx.name] = tx.amount + obj[tx.name])
        : (obj[tx.name] = tx.amount);
      return obj;
    }, {});
  }, [monthlyTransactions]);

  // sort names by spending totals
  const sortedNames = useMemo(() => {
    const namesArray = [];
    for (const name in namesObject) {
      namesArray.push([name, namesObject[name]]);
    }
    namesArray.sort((a: any[], b: any[]) => b[1] - a[1]);
    namesArray.splice(5); // top 5
    return namesArray;
  }, [namesObject]);


  const ChatComponent = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState('');
  
    const handleSend = () => {
      setMessages([...messages, input]);
      setInput('');
    };
  
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ height: '200px', overflowY: 'scroll', padding: '10px', marginBottom: '10px' }}>
        {messages.map((message, index) => (
          <p key={index} style={{ background: '#f9f9f9', padding: '5px', borderRadius: '5px', margin: '10px 0' }}>{message}</p>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <input value={input} onChange={e => setInput(e.target.value)} style={{ flex: '1', marginRight: '10px', padding: '5px' }} />
        <button onClick={handleSend} style={{ padding: '5px 10px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '5px' }}>Send</button>
      </div>
      </div>

    );
  };
  
  
  return (
    <div>
      <div>
      <h4 className="holdingsHeading">Hi! Let's categorize your latest expenses</h4>
      <ChatComponent />
      </div>
      <div>
        <h2 className="monthlySpendingHeading">Monthly Spending</h2>
        <h4 className="tableSubHeading">A breakdown of your monthly spending</h4>
        <div className="monthlySpendingText">{`Monthly breakdown across ${
          props.numOfItems
        } bank ${pluralize('account', props.numOfItems)}`}</div> 
        <div className="monthlySpendingContainer">
        <div className="userDataBox">
            <div className="holdingsList">
              <h4 className="holdingsHeading">Personal Expenses {personalExpenses}</h4>
              <div className="spendingInsightData">
                <p className="title">Expense</p> <p className="title">Amount</p>
                {sortedNames.map((vendor: any[]) => (
                  <>
                    <p>{vendor[0]}</p>
                    <p>{currencyFilter(vendor[1])}</p>
                  </>
                ))}
              </div>
            </div>
          </div>
          <div className="userDataBox">
            <div className="holdingsList">
              <h4 className="holdingsHeading">Business Expenses</h4>
              <div className="spendingInsightData">
                <p className="title">Expense</p> <p className="title">Amount</p>
                {sortedNames.map((vendor: any[]) => (
                  <>
                    <p>{vendor[0]}</p>
                    <p>{currencyFilter(vendor[1])}</p>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
}
