import React, { useEffect, useState } from 'react';
import { Question, QuestionType, useAppDispatch, useAppSelector, useGetCurrentQuestion } from '../../api';
import styles from './index.module.scss';
import { increment as incrementScore, decrement as decrementScore } from '../../state/score/scoreSlice';
import { increment as incrementQuestion, clearQuestions } from '../../state/questions/questionSlice'
import Button from '../Button';
import { useNavigate } from 'react-router-dom';

type GoNextType = {
  isLastQuestion: boolean
  setAnswer: React.Dispatch<React.SetStateAction<string[]>>
  setIsCorrect: React.Dispatch<React.SetStateAction<boolean | undefined>> 
}

const GoNext: React.FC<GoNextType> = ( {setIsCorrect, isLastQuestion, setAnswer} ) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const handleGoNext: () => void = () => {
    if (!isLastQuestion) {
      setIsCorrect(undefined);
      setAnswer([]);
      dispatch(incrementQuestion())
    } else {
      setAnswer([]);
      dispatch(clearQuestions())
      navigate('/highscore')
    }
  } 
  return (
    <Button btnType='NextQuestion' text={!isLastQuestion ? 'Next question': 'Finish game!'} onClick={handleGoNext} />
  )
}

type QuestionForm = {
  question: Question
  answer: string[]
  setAnswer: React.Dispatch<React.SetStateAction<string[]>>
  isCorrect: boolean | undefined
  handleFormSubmission: (e: React.FormEvent<HTMLFormElement>) => void
}

const QuestionForm: React.FC<QuestionForm> = ({ question, answer, setAnswer, isCorrect, handleFormSubmission }) => {
  const handleCheck = (answerOption: string) => {
    if (answer?.includes(answerOption)) {
      setAnswer( prev => prev.filter(answer => answer !== answerOption))
    } else setAnswer(prev => [...prev, answerOption])
  }
  return (
    <form onSubmit={handleFormSubmission}>
      <div>
        {question.type === QuestionType.single && question.answers.map(answerOption => (
            <div key={answerOption} className={styles.CardQuestion}>
              <input className={styles.CardQuestionRadio} type='radio' id={answerOption} value={answer} checked={answer?.includes(answerOption)} onChange={() => setAnswer([answerOption])} disabled={isCorrect !== undefined} />
              <label htmlFor={answerOption}>{answerOption}</label>
            </div>
          ))}
        {question.type === QuestionType.multiple && question.answers.map(answerOption => (
          <div key={answerOption} className={styles.CardQuestion}>
            <input type='checkbox' id={answerOption} value={answer} checked={answer?.includes(answerOption)} onChange={() => handleCheck(answerOption)} disabled={isCorrect !== undefined}/>
            <label htmlFor={answerOption}>{answerOption}</label>
          </div>
        ))}
      </div>
      <button className={styles.CardSubmitBtn} disabled={!answer || isCorrect !== undefined}>Submit answer</button>
  </form>
  )
}

const QuestionCard: React.FC = () => {
  const [answer, setAnswer] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>();
  const [isLastQuestion, setIsLastQuestion] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const question = useGetCurrentQuestion();
  const questionState = useAppSelector(state => state.question);

  useEffect(() => {
    if (questionState.index === questionState.questions.length-1) setIsLastQuestion(true);
  }, [question])

  const validateMCAnswers: (answer: string[], correct_answers: string[]) => boolean = (answer, correct_answers) => {
    if (answer.length !== correct_answers.length)  return false
    answer.forEach(option => {
      if (!correct_answers.includes(option)) return false
    })
    return true
  }

  const correctAnswer = (question: Question) => {
    dispatch(incrementScore(question.value));
    setIsCorrect(true)
  }

  const incorrectAnswer = () => {
    dispatch(decrementScore());
    setIsCorrect(false)
  }

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (question.type === QuestionType.single && question.correct_answer === answer[0]) {
      return correctAnswer(question)
    } 
    if (question.type === QuestionType.multiple) {
      if (Array.isArray(question.correct_answer)  && validateMCAnswers(answer, question.correct_answer)) {
        return correctAnswer(question)
      }
    }
    return incorrectAnswer()
  }

  return (
    <div className={styles.Card}>
      <div className={styles.CardHeader}>
        <h3>{question.question}</h3>
      </div>
      <div className={styles.CardBody}>
        <QuestionForm question={question} answer={answer} setAnswer={setAnswer} isCorrect={isCorrect} handleFormSubmission={handleFormSubmission} />
        {isCorrect !== undefined ?
          (answer.length && isCorrect) ? (
            <>
              <h3>{`Yes! ${Array.isArray(question.correct_answer) 
                ? `${question.correct_answer.join(', ')} are`
                : `${question.correct_answer} is`} 
                correct! +${question.value} score`}</h3>
              <GoNext isLastQuestion={isLastQuestion} setIsCorrect={setIsCorrect} setAnswer={setAnswer}/>
            </>
          ) : (
            <>
              <h3>{`Oh no! ${answer} was not the correct answer. The correct answer was ${question.correct_answer}! -1 score`}</h3>
              <GoNext isLastQuestion={isLastQuestion} setIsCorrect={setIsCorrect} setAnswer={setAnswer}/>
            </>
          )
          : null
        }
      </div>
    </div>
  )
}

export default QuestionCard