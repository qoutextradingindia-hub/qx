import React from 'react';
import './SalaryIncome.css'; // अगर आपने CSS फाइल अलग बनाई है तो

const SalaryIncome = () => {
  return (
    <div className="salary-container">
      <h1 className="Salary-title">SALARY INCOME</h1>
      <p className="salary-subtitle">Start earning daily fixed salary income based on your direct business:</p>
      <div className="salary-table-wrapper">
        <table className="salary-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Direct Business Volume</th>
              <th>Daily Salary</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Level 1</td><td>$1,250</td><td>$5/day</td></tr>
            <tr><td>Level 2</td><td>$2,500</td><td>$10/day</td></tr>
            <tr><td>Level 3</td><td>$5,000</td><td>$20/day</td></tr>
            <tr><td>Level 4</td><td>$10,000</td><td>$40/day</td></tr>
            <tr><td>Level 5</td><td>$20,000</td><td>$80/day</td></tr>
            <tr><td>Level 6</td><td>$40,000</td><td>$160/day</td></tr>
            <tr><td>Level 7</td><td>$80,000</td><td>$320/day</td></tr>
            <tr><td>Level 8</td><td>$160,000</td><td>$640/day</td></tr>
            <tr><td>Level 9</td><td>$320,000</td><td>$1,280/day</td></tr>
            <tr><td>Level 10</td><td>$640,000</td><td>$2,560/day</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryIncome;