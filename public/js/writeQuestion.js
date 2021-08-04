// Add answer to database
// Add answerkey to database
// Display answer


// Access and display all questions when page loads
window.onload = event => {
    getQuestions();
}

// Get questions
const getQuestions = () => {
    
    dbRef = firebase.database().ref();
    // let questionRef = firebase.database().ref('questions');

    dbRef.on('value', (snapshot) => {
        const dbRef = snapshot.val();
        let questions = dbRef.questions;

        for (const questionId in questions) {
            let answersData = questions[questionId].answers;
            
            let answerTextArray = [];
            for (const answerId in answersData) {
                console.log(answerId, answersData);
                let answerText = dbRef.answers[answerId].answerText;
                console.log(answerText);
                answerTextArray.push(answerText);
            }

            renderQuestionAsHTML(questionId, questions, answerTextArray);
        }
    })
};


// Function to submit question
const submitQuestion = () => {
    let SubmitQuestionButton = document.querySelector("#submit-question");
    let newQuestion = document.querySelector("#new-question");

    // Add timestamp
    let submissionTimestamp = new Date();
    date = submissionTimestamp.getFullYear()+'-'+(submissionTimestamp.getMonth()+1)+'-'+submissionTimestamp.getDate();
    time = submissionTimestamp.getHours() + ":" + submissionTimestamp.getMinutes() + ":" + submissionTimestamp.getSeconds();
    let dateTime = date+' '+time;

    // Push data
    firebase.database().ref('questions').push({
        questionText: newQuestion.value,
        submissionTime: dateTime,
        questionProperties: {
            upvotes: 0
        }
    })
};

// Function to submit answer
let submitAnswer = (questionId) => {
    let newAnswer = document.querySelector(`#${questionId}-new-answer`);
    console.log(newAnswer.value);

    // Add timestamp
    let submissionTimestamp = new Date();
    date = submissionTimestamp.getFullYear()+'-'+(submissionTimestamp.getMonth()+1)+'-'+submissionTimestamp.getDate();
    time = submissionTimestamp.getHours() + ":" + submissionTimestamp.getMinutes() + ":" + submissionTimestamp.getSeconds();
    let dateTime = date+' '+time;

    // Push answer
    let answerPushId = firebase.database().ref('answers').push({
        answerText: newAnswer.value,
        submissionTime: dateTime,
        answerProperties: {
            upvotes: 0
        }
    })

    // Push answerKey
    let answerKey = answerPushId.getKey();
    firebase.database().ref(`questions/${questionId}/answers`).update({
        [answerKey]: true
    });
};

// Function to render questions and answers
const renderQuestionAsHTML = (questionId, questions, answerTextArray) => {
    let questionCards = document.querySelector("#quarum-app");
    questionCards.innerHTML += createCard(questionId, questions, answerTextArray);
};



// Function to create card
const createCard = (questionId, questions, answerTextArray) => {
    let answersHtml = ``;
    for (i=0; i<answerTextArray.length; i++) {
        console.log(answerTextArray[i]);
        answersHtml += `
        <footer class="card-footer">
            <div class="card-footer-item">
                ${answerTextArray[i]}
            </div>
        </footer>
        `;
    }
    return `
    <div class="card">
        <header class="card-header">
            <p class="card-header-title">
                ${questions[questionId].questionText}
            </p>
            <div class="dropdown" id="${questionId}-dropdown">
                <div class="dropdown-trigger">
                    <button class="button is-up"  aria-haspopup="true" aria-controls="dropdown-menu">
                        <span class="icon is-small">
                            <i class="fas fa-angle-down" aria-hidden="true" onclick="showOptions('${questionId}')"></i>
                        </span>
                    </button>
                </div>
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                        <a href="#" class="dropdown-item">Upvote</a>
                        <a href="#" class="dropdown-item">Edit</a>
                        <a href="#" class="dropdown-item">Delete</a>
                    </div>
                </div>
            </div>]
        </header>
        <div class="card-content">
            <div class="contern">
                <time datetime="2016-1-1">${questions[questionId].submissionTime} <br> Upvotes: ${questions[questionId].questionProperties.upvotes}</time>
                <input class="input is-link" type="text" placeholder="Answer question" id="${questionId}-new-answer">
                <button class="button" id="${questionId}-submit-answer" onclick="submitAnswer('${questionId}')">Submit</button>
            </div>
        </div>
        ${answersHtml}
    </div>
    <br>
    `;
};

let showOptions = (id) => {
    let dropdown = document.querySelector(`#${id}-dropdown`);
    console.log(dropdown);
    dropdown.classList.toggle('is-active');
};
