import React, { useState, useEffect } from "react";
import './MoneySplit.css'; // 별도의 CSS 파일을 사용하여 스타일을 관리

export default function MoneySplit() {
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState("");
  const [payer, setPayer] = useState("");
  const [amount, setAmount] = useState("");
  const [maxReceiverPercentage, setMaxReceiverPercentage] = useState("");
  const [history, setHistory] = useState({});

  useEffect(() => {
    const storedData = localStorage.getItem("splitHistory");
    if (storedData) {
      setHistory(JSON.parse(storedData));
    }
  }, []);

  const addParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant("");
    }
  };

  const removeParticipant = (name) => {
    setParticipants(participants.filter((p) => p !== name));
  };

  const distributeMoney = () => {
    if (!amount || !payer || !maxReceiverPercentage) {
      alert("모든 입력값을 채워주세요.");
      return;
    }

    const totalAmount = parseFloat(amount) || 0;
    const maxPercentage = parseFloat(maxReceiverPercentage) || 0;
    const receivers = participants.filter((p) => p !== payer);

    if (receivers.length < 1) {
      alert("돈을 받을 사람이 최소 한 명 있어야 합니다.");
      return;
    }

    const maxReceiverIndex = Math.floor(Math.random() * receivers.length);
    let remainingAmount = totalAmount;
    let distributedAmounts = new Array(receivers.length).fill(0);
    let maxReceiverAmount = Math.round((totalAmount * maxPercentage) / 100);
    distributedAmounts[maxReceiverIndex] = maxReceiverAmount;
    remainingAmount -= maxReceiverAmount;

    let equalShare = Math.floor(remainingAmount / (receivers.length - 1));
    for (let i = 0; i < receivers.length; i++) {
      if (i !== maxReceiverIndex) {
        distributedAmounts[i] = equalShare;
      }
    }
    distributedAmounts[maxReceiverIndex] += totalAmount - distributedAmounts.reduce((a, b) => a + b, 0);

    let updatedHistory = { ...history };
    if (!updatedHistory[payer]) {
      updatedHistory[payer] = {};
    }

    receivers.forEach((person, index) => {
      if (!updatedHistory[payer][person]) {
        updatedHistory[payer][person] = 0;
      }
      updatedHistory[payer][person] += distributedAmounts[index];
    });

    setHistory(updatedHistory);
    localStorage.setItem("splitHistory", JSON.stringify(updatedHistory));
    setAmount("");
    setMaxReceiverPercentage("");
  };

  const clearHistory = () => {
    if (window.confirm("⚠️ 모든 기록이 삭제됩니다. 정말 초기화할까요?")) {
      localStorage.removeItem("splitHistory");
      setHistory({});
    }
  };

  return (
    <div className="container">
      <h2>💸 돈 뿌리기</h2>
      <div className="section">
        <h3>👥 참가자</h3>
        <input
          type="text"
          placeholder="참가자 이름 입력"
          value={newParticipant}
          onChange={(e) => setNewParticipant(e.target.value)}
        />
        <button onClick={addParticipant}>추가</button>
        <ul>
          {participants.map((p) => (
            <li key={p}>
              {p} <button onClick={() => removeParticipant(p)}>❌</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h3>💰 돈 낼 사람 선택</h3>
        <select onChange={(e) => setPayer(e.target.value)}>
          <option value="">-- 선택하세요 --</option>
          {participants.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="section">
        <h3>💰 금액 및 설정</h3>
        <input type="text" placeholder="보낼 금액" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input type="text" placeholder="최대 받을 사람 비율 (%)" value={maxReceiverPercentage} onChange={(e) => setMaxReceiverPercentage(e.target.value)} />
        <button onClick={distributeMoney}>뿌리기</button>
        <button onClick={clearHistory} className="danger">🗑️ 초기화</button>
      </div>

      <div className="section">
        <h3>📜 누적 기록 (뿌린 사람 → 받는 사람 금액)</h3>
        {Object.keys(history).length === 0 ? <p>기록이 없습니다.</p> : null}
        {Object.entries(history).map(([giver, receivers]) => (
          <div key={giver} className="history-entry">
            <p><strong>{giver}</strong>님이 보낸 금액:</p>
            {Object.entries(receivers).map(([receiver, amount], idx) => (
              <p key={idx}>{receiver}: {Number(amount).toFixed(2)}원</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
