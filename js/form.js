let data = [];

try {
  fetch("https://opentdb.com/api.php?amount=10")
    .then((response) => response.json())
    .then((questions) => (data = questions.results));
} catch (error) {
  console.log(error);
}

const shuffleQuestions = (data) => {
  for (let i = 0; i < data.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
  }
};

shuffleQuestions(data);

let userAnswersArr = [];
const timeDisplay = document.getElementById("timer");
const quizContainer = document.getElementById("quiz");
const totalQuestions = document.getElementById("totalQuestions");
const answerDisplay = document.getElementById("correctAnswerContainer");
const startBtn = document.getElementById("startBtn");
let duration = 60;
let currentQuestionIndex = 0;
let score = 0;
let correctAnswer = false;
let timer;

// Timer Code Starts Here

// To Convert into Hour Minutes and Seconds
const ConvertToHMS = (seconds) => {
  const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0"),
    m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0"),
    s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

  timeDisplay.innerText = `Time Remaining:  ${h + ":" + m + ":" + s}`;
};

//Start the actual function
const startCountdown = () => {
  let timeRemaining = duration;
  timer = setInterval(() => {
    ConvertToHMS(timeRemaining);
    timeRemaining--;
    if (timeRemaining < 0) {
      clearInterval(timer);
      answerDisplay.innerHTML = `<h3> Time's Up! </h3>`;
      endQuiz();
    }
  }, 1000);
};
//Timer Code Ends Here

function startQuiz() {
  startCountdown();
  document.getElementById("progressBar").innerHTML = progressBar();
  displayQuestion();
  startBtn.style.display = "none";
}

startBtn.addEventListener("click", startQuiz);

function progressBar() {
  if (currentQuestionIndex < data.length) {
    return `<div class="progress border-0 rounded-0">
    <div class="progress-bar  bg-warning progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:${
      100 - (currentQuestionIndex / data.length) * 100
    }%"></div>
  </div>`;
  } else {
    return `<div></div>`;
  }
}

// To Render Data and Update
const displayQuestion = () => {
  const currentQuestion = data[currentQuestionIndex];

  currentQuestion.incorrect_answers.push(currentQuestion.correct_answer);

  shuffleQuestions(currentQuestion.incorrect_answers);

  const options = currentQuestion.incorrect_answers
    .map((option) => {
      return `<div class='form-check mb-3 p-0'>
    <input class='form-check-input' type='radio' name='answers' id=${option} value="${option}">
    <label class='form-check-label w-100 ' for=${option}>${option}</label>
    </div>`;
    })
    .join("");

  document.getElementById("progressBar").innerHTML = progressBar();

  totalQuestions.innerHTML = `${currentQuestionIndex + 1} / ${data.length}`;

  quizContainer.innerHTML = `
  <div class="quiz-container">
    <h2 class='mb-4'>${currentQuestion.question}</h2>
    ${options}
    <button class='btn btn-primary bg-white text-black border-0 w-100 mt-4 fw-medium' id="nextButton" onclick="checkAnswer()"> Next </button>
  </div>`;
  // To check Correct Answer and Update Score
};

const checkAnswer = () => {
  const selectedAnswer = document.querySelector("input[type='radio']:checked");
  if (!selectedAnswer) {
    answerDisplay.innerHTML = `<h4 class='font-medium text-center'>Please Select an option</h4>`;
    answerDisplay.style.color = "#fb6464";
    return;
  }

  const currentQuestion = data[currentQuestionIndex];

  userAnswersArr.push({ question: currentQuestion.question, userAnswer: selectedAnswer.value, status: "" });

  if (selectedAnswer.value === currentQuestion.correct_answer) {
    answerDisplay.innerHTML = `<h4 class='font-medium text-center'>Correct</h4>`;
    answerDisplay.style.color = "#4eff4e";
    userAnswersArr[currentQuestionIndex].status = "correct";
    score++;
  } else {
    answerDisplay.innerHTML = `<h4 class='font-medium text-center'>Incorrect</h4>`;
    answerDisplay.style.color = "#fb6464";
    userAnswersArr[currentQuestionIndex].status = "Incorrect";
  }

  currentQuestionIndex++;

  if (currentQuestionIndex < data.length) {
    displayQuestion();
    if (currentQuestionIndex === data.length - 1) {
      document.getElementById("nextButton").innerText = "Submit";
    }
  } else {
    endQuiz();
  }
};

function percentage() {
  return (100 * score) / data.length;
}

const displayResult = () => {
  document.getElementById("progressBar").innerHTML = progressBar();

  quizContainer.innerHTML = `
  <div class="quiz-container">
    <h2 class='text-white'>Quiz Ended</h2>
    <h2 class='text-white'>Score: ${score} out of ${data.length}</h2>
    <h2 class='text-white'> Percentage: ${percentage().toFixed(2)}% </h2>
    <button onclick= "resetQuiz()" class="reset-btn btn btn-danger d-block my-3">Restart</button>
  </div>`;

  const displayAnswersHtml = userAnswersArr
    .map(
      (item) => `<div class='item border border-2 p-3 my-3 rounded'>
    <p class='fs-5 text-white fw-medium'> ${item.question} </p>
    <p class='fs-5 text-white fw-medium'> ${item.userAnswer} <span class=${item.status === "correct" ? "correct" : "incorrect"}> (${item.status}) </span> </p>
  </div>`
    )
    .join("");

  quizContainer.innerHTML += `<div class="quiz-container my-4">
  <h2 class="text-center"> Review your Answers </h2>
  ${displayAnswersHtml}
  </div>`;
};

const endQuiz = () => {
  displayResult();
  totalQuestions.style.display = "none";
  clearInterval(timer);
  console.log(userAnswersArr);
  timeDisplay.style.display = "none";
};

const resetQuiz = () => {
  score = 0;
  currentQuestionIndex = 0;
  correctAnswer = false;
  userAnswersArr = [];
  timeDisplay.style.display = "block";
  totalQuestions.style.display = "block";
  answerDisplay.innerText = "";
  shuffleQuestions(data);
  startQuiz();
};
