import React, { useEffect, useState } from 'react';
import Button from '../../components/Button';
import { getLocalScorage } from '../../utils/LocalScorage';
import { Scores } from '../../types';
import styles from './index.module.scss';
import { useNavigate } from "react-router-dom";


const HighScores:React.FC = () => {
  const [scores, setScores] = useState<Scores>([]);
  const [warning, setWarning] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    setScores(getLocalScorage());
    }, []);

  const handleResetScorage = () => {
    setWarning(false);
    localStorage.setItem('quiz-scores', '[]');
    setScores(getLocalScorage());
  }

  return (
    <div  className={styles.Grid}>
        <h2 className={styles.Title}><u>High Scores</u></h2>
        <div className={styles.Date}><u>Date</u></div>
        <div className={styles.Username}><u>Username</u></div>
        <div className={styles.Score}><u>Score</u></div>  
        {scores.length 
          ? scores.map(score => (
            <React.Fragment key={score.id}>
              <div  className={styles.Date}>{score.date}</div>
              <div className={styles.Username}>{score.userName}</div>
              <div className={styles.Score}>{score.score}</div>
            </React.Fragment>
          )) : <div className={styles.Title}>No scores recorded!</div>}
      {!warning ? (
          <Button 
            text='Clear high scores'
            btnType='Play'
            onClick={() => setWarning(true)}
            disabled={!scores.length}/>
          ) : (
            <Button 
              text='Really clear high scores?' 
              btnType='Abandon' 
              onClick={handleResetScorage} 
              onMouseLeave={() => setWarning(false)}/>
          ) 
      }
      {<Button text="Go Home" btnType="Play" onClick={() => navigate("/")} />}
    </div>
  );
};

export default HighScores;