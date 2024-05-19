import React from 'react';
import Button from 'plaid-threads/Button';

const PLAID_ENV = process.env.REACT_APP_PLAID_ENV;

interface Props {
  initialSubheading?: boolean;
}

const Banner = (props: Props) => {
  const initialText =
    'Your Personal Finance Assistant that uses Plaid and Amazon integration to record your expenses seamlessly.';

  const successText =
    "View your net worth, spending patterns and chat with FinFast to categorize your expenses.";

  const subheadingText = props.initialSubheading ? initialText : successText;

  return (
    <div id="banner" className="bottom-border-content">
      <h4>{PLAID_ENV} user</h4>
      <div className="header">
        <h1 className="everpresent-content__heading">FinFast</h1>
        <Button
          href="https://docs.google.com/forms/d/e/1FAIpQLSfF4Xev5w9RPGr7fNkSHjmtE_dj0ELuHRbDexQ7Tg2xoo6tQg/viewform"
          target="_blank"
          rel="noopener noreferrer"
          inline
          centered
          secondary
        >
          Provide feedback on the Fast demo app
        </Button>
      </div>
      <p id="intro" className="everpresent-content__subheading">
        {subheadingText}
      </p>
    </div>
  );
};

export default Banner;
