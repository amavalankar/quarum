// cd .window.onload(console.log("HELLO"));


// Function to submit question
const submitQuestion = () => {
    let SubmitQuestionButton = document.querySelector("#submit-question");
    let newQuestion = document.querySelector("#new-question");
    let submissionTimestamp = new Date();
    // console.log(submissionTimestamp);

    date = submissionTimestamp.getFullYear()+'-'+(submissionTimestamp.getMonth()+1)+'-'+submissionTimestamp.getDate();
    time = submissionTimestamp.getHours() + ":" + submissionTimestamp.getMinutes() + ":" + submissionTimestamp.getSeconds();
    let dateTime = date+' '+time;

    firebase.database().ref('questions').push({
        questionText: newQuestion.value,
        submissionTime: dateTime,
        questionProperties: {
            upvotes: 0
        }
    })

    let questionRef = firebase.database().ref('questions');
    questionRef.on('value', (snapshot) => {
        const questions = snapshot.val();

        for (const questionId in questions) {
            console.log(questions[questionId]);
            renderQuestionAsHTML(questionId, questions);
        }
    })

};

// Function to render question
const renderQuestionAsHTML = (questionId, questions) => {
    let questionCards = document.querySelector("#quarum-app");
    questionCards.innerHTML += createCard(questionId, questions);
};

// Function to create card
const createCard = (questionId, questions) => {
    return `
    <div class="card">
        <header class="card-header">
            <p class="card-header-title">
                ${questions[questionId].questionText}
            </p>
            <button class="card-header-icon" aria-label="more options">
                <span class="icon">
                    <i class="fas fa-angle-down" aria-hidden="true"></i>
                </span>
            </button>
        </header>
        <div class="card-content">
            <div class="contern">
                <time datetime="2016-1-1">${questions[questionId].submissionTime} <br> Upvotes: ${questions[questionId].questionProperties.upvotes}</time>
            </div>
        </div>
        <footer class="card-footer">
            <a href="#" class="card-footer-item">Upvote</a>
            <a href="#" class="card-footer-item">Edit</a>
            <a href="#" class="card-footer-item">Delete</a>
            <a href="#" class="card-footer-item">Comment</a>
        </footer>
    </div>
    <br>
    `;
};