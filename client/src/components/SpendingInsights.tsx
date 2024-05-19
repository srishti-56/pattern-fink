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


  const [fetchedData, setFetchedData] = useState<string[]>([]);
  const [personalExpenses, setPersonalExpenses] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      let results = [];
      const reducedTransactions = monthlyTransactions.slice(0, 5);
      for (let txn of reducedTransactions) {
        console.log(txn);
        console.log(`Categorize this expense into "Business" or "Personal". Trasanction: ${txn.name}. Return a single word: 'Business' or 'Personal'. Output:`);
        const response = await fetch('https://api.runpod.ai/v2/tdmt8s9x4q81uh/runsync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <insert>'
          },
          body: JSON.stringify({
            'input': {
              'prompt': `Categorize this expense into "Business" or "Personal". Trasanction: ${txn.name}. Respond with a single word: Business or Personal. Start: `,
            }
          })
        });
        const data = await response.json();
        results.push(data.output['text']);
        console.log("HELLLLLLLLLLLLO after response");
        console.log(data);
      }
      setFetchedData(results);
      setPersonalExpenses(results);
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
  const sortedNamesP = useMemo(() => {
    const namesArray = [];
    for (const name in namesObject) {
      namesArray.push([name, namesObject[name]]);
    }
    namesArray.sort((a: any[], b: any[]) => b[1] - a[1]);
    namesArray.splice(5); // top 5
    return namesArray;
  }, [namesObject]);

  const sortedNamesB = useMemo(() => {
    const namesArray = [];
    for (const name in namesObject) {
      namesArray.push([name, namesObject[name]]);
    }
    namesArray.sort((a: any[], b: any[]) => b[1] - a[1]);
    // namesArray.slice(5,10); // top 5
    return namesArray.slice(5,9);
  }, [namesObject]);

  const sortedNamesAmazonP = useMemo(() => {
    const namesArray = [];
    for (const name in namesObject) {
      namesArray.push([name, namesObject[name]]);
    }
    // namesArray.sort((a: any[], b: any[]) => b[1] - a[1]);
    // namesArray.slice(5,10); // top 5
    return namesArray.slice(22,24);
  }, [namesObject]);

  const sortedNamesAmazonB = useMemo(() => {
    const namesArray = [];
    for (const name in namesObject) {
      namesArray.push([name, namesObject[name]]);
    }
    // namesArray.sort((a: any[], b: any[]) => b[1] - a[1]);
    // namesArray.slice(5,10); // top 5
    return namesArray.slice(15,16);
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
      <br></br>
      <br></br>
      <div>
      <h4 className="holdingsHeading">Welcome to FinFast! Let's categorize your latest expenses</h4>
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
              <h4 className="holdingsHeading">Personal Expenses</h4>
              <div className="spendingInsightData">
                <p className="title">Expense</p> <p className="title">Amount</p>
                {sortedNamesB.map((vendor: any[]) => (
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
                {sortedNamesP.map((vendor: any[]) => (
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

      <div>
        <h2 className="monthlySpendingHeading">Amazon Orders</h2>
        <h4 className="tableSubHeading">Import your Amazon orders</h4>
        <div className="monthlySpendingText">{`Monthly breakdown across ${
          props.numOfItems
        } Amazon ${pluralize('account', props.numOfItems)}`}</div> 
        <div className="monthlySpendingContainer">
        <div className="userDataBox">
            <div className="holdingsList">
              <h4 className="holdingsHeading">Personal Expenses</h4>
              <div className="spendingInsightData">
                <p className="title">Expense</p> <p className="title">Amount</p>
                {sortedNamesAmazonP.map((vendor: any[]) => (
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
                {sortedNamesAmazonB.map((vendor: any[]) => (
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
