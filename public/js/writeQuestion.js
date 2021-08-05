// Add answer to database
// Add answerkey to database
// Display answer


// Access and display all questions when page loads

// Since we import from multiple JS files, we cannot simply use the window.onload() event because there are multiple things that need to be ran when the window loads.
// Thus, we create the addLoadEvent(function()) function that — when given a function — adds it to a queue of functions that loads when the page loads.
// The function itself, which can be ignored, is at the bottom of this file. Be sure not to edit or remove it! :D
addLoadEvent(function() {
    // Verify if the user is signed in. If not, redirect to index.html
    verifyUserAuthentication();
});

addLoadEvent(function() {
    // Given a search parameter ("?id=123456"), get the Quarum ID
    quarumID = getQuarumID();

    document.title = `${quarumID} — Quarum`;

    // For all items with the "quarum-id" class, display the Quarum ID
    document.querySelectorAll(".quarum-id").forEach((item) => {
        item.innerHTML = quarumID;
    })
});

const getQuarumID = () => {

    // Get the current URL.
    const queryString = window.location.search;
    
    // Get the params ("?id=123456") from the URL
    const urlParams = new URLSearchParams(queryString);

    // Get the details of the "id" parameter and return it
    const queryID = urlParams.get('id')
    return queryID;
}

const verifyUserAuthentication = () => {

    // Create an attached observer of the user's authentication state
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // If the user is signed in, render the questions
            getQuestions();
            console.log(`User signed in as: ${user.displayName}`);
            console.log(user);
        } else {
            // If the user signs out, redirect to index.html    
            window.location = 'index.html';
        }
    });
}


// Get questions
const getQuestions = () => {

    // Database reference
    const dbRef = firebase.database().ref();

    // Create an observer on the entire database
    // NOTE: It may be more worthwhile to attach to the specific Quarum within the database than the entire DB itself.
    dbRef.on('value', (snapshot) => {
        const dbData = snapshot.val();

        // Render the retireved database data
        renderQuestionAsHTML(dbData);

        // let questions = dbRef.questions;
        // for (const questionId in questions) {
        //     let answersData = questions[questionId].answers;
            
        //     let answerTextArray = [];
        //     for (const answerId in answersData) {
        //         // console.log(answerId, answersData);
        //         let answerText = dbRef.answers[answerId].answerText;
        //         // console.log(answerText);
        //         answerTextArray.push(answerText);
        //     }

        //     renderQuestionAsHTML(questionId, questions, answerTextArray);
        // }
    });
};

// Function to render questions and answers
const renderQuestionAsHTML = (obj) => {
    let questions = obj.questions;
    let cards = ``;

    // NOTE: When we implement sorting functionality, we'll need to use a .forEach instead on the snapshot object
    // Additionally, we'll need to add the sorting to the data retrieval on lines 64 and 65.
    // Refer to the documentation here: https://github.com/amavalankar/FirebaseSortBy/blob/main/README.md
    for (const questionId in questions) {
        let answersData = questions[questionId].answers;
        let answerTextArray = [];
        for (const answerId in answersData) {
            // console.log(answerId, answersData);
            let answerText = obj.answers[answerId].answerText;
            // console.log(answerText);
            answerTextArray.push(answerText);
        }
        cards += createCard(questionId, questions, answerTextArray);
    }
    let questionCards = document.querySelector("#quarum-app");
    questionCards.innerHTML = cards;
};

// // Function to render questions and answers
// const renderQuestionAsHTML = (questionId, questions, answerTextArray) => {
//     let questionCards = document.querySelector("#quarum-app");
//     questionCards.innerHTML += createCard(questionId, questions, answerTextArray);
// };

// Function to submit question
const submitQuestion = () => {
    let SubmitQuestionButton = document.querySelector("#submit-question");
    let newQuestion = document.querySelector("#new-question");

    // Add timestamp
    let submissionTimestamp = new Date();
    date = submissionTimestamp.getFullYear()+'-'+(submissionTimestamp.getMonth()+1)+'-'+submissionTimestamp.getDate();
    time = submissionTimestamp.getHours() + ":" + submissionTimestamp.getMinutes() + ":" + submissionTimestamp.getSeconds();
    let dateTime = date+' '+time;

    console.log(`New question value: ${newQuestion.value}`);

    // Push data
    firebase.database().ref('questions').push({
        questionText: newQuestion.value,
        submissionTime: dateTime,
        questionProperties: {
            upvotes: 0
        }
    });

    newQuestion.value = "";
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


// Function to create card
const createCard = (questionId, questions, answerTextArray) => {
    let answersHtml = ``;
    for (i=0; i<answerTextArray.length; i++) {
        // console.log(answerTextArray[i]);
        answersHtml += `
        <p>${answerTextArray[i]}</p>
        <hr class="is-grey my-3">
        `;
    }

    return `
    <div class="my-4">
        <article class="message is-light">
            <div class="message-header pb-1">
                <p class="is-size-5"><b>${questions[questionId].questionText}</b></p>
                            <a class="star one-line" onclick="upvoteQuestion('${questionId}', ${questions[questionId].questionProperties.upvotes})" id="${questionId}-upvoteButton">${questions[questionId].questionProperties.upvotes} <i class="far fa-star"></i></a>
                        </div>

                        <div class="message-header has-text-grey pt-1 pb-2">
                            <p><time datetime="2016-1-1">${questions[questionId].submissionTime}</time></p>
                            
                            <div class="dropdown is-right" id="${questionId}-dropdown">
                                <div class="dropdown-trigger">
                                    <a class="icon is-small" onclick="showOptions('${questionId}')" aria-haspopup="true" aria-controls="dropdown-menu">
                                        <i class="fas fa-ellipsis-h"></i>
                                    </a>
                                    </button>
                                </div>
                                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                                    <div class="dropdown-content">
                                        <a class="dropdown-item" onclick="editQuestion('${questionId}')">Edit</a>
                                        <a class="dropdown-item" onclick="deleteQuestion('${questionId}')">Delete</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="message-body">
                            ${answersHtml}

                            <div class="field has-addons mt-4">
                                <div class="control is-expanded">
                                    <input class="input is-rounded" type="text" placeholder="Answer question" id="${questionId}-new-answer">
                                </div>

                                <div class="control">
                                    <button class="button brand-color-fill is-rounded" id="${questionId}-submit-answer" onclick="submitAnswer('${questionId}')">Submit</button>
                                </div>
                        </div>
                </div>
            </div>
        </article>
    </div>
    `;
};

// Toggle edit options
let showOptions = (id) => {
    let dropdown = document.querySelector(`#${id}-dropdown`);
    //console.log(dropdown);
    dropdown.classList.toggle('is-active');
};

const editQuestion = (questionId) => {
    const editQuestionModal = document.querySelector("#editQuestionModal");
    console.log(editQuestionModal);
    editQuestionModal.classList.toggle("is-active");

    firebase.database().ref(`/questions/${questionId}/questionText`).once('value').then((snapshot) => {
        console.log(snapshot.val());
        document.querySelector("#editQuestionInput").value = snapshot.val();
    });
    // showOptions(questionId);

    const saveButton = document.querySelector("#save-button");
    saveButton.addEventListener("click", (event) => {
        let newQuestionText = document.querySelector("#editQuestionInput").value;
        firebase.database().ref(`questions/${questionId}`)
            .update({
                questionText: newQuestionText
            });
        document.querySelector("#editQuestionInput").value = '';
        closeEditModal();
    });

    showOptions(questionId);
};

const upvoteQuestion = (questionId, currentUpvotes) => {

    upvoteButton = document.querySelector(`#${questionId}-upvoteButton`);
    currentUID = firebase.auth().currentUser.uid;

    firebase.database().ref(`questions/${questionId}/questionProperties/upvoteUsers/${currentUID}`).get().then((snapshot) => {

        if (snapshot.exists()) {

            //console.log(`User of UID: ${currentUID} is found in upvotes`);
            firebase.database().ref(`questions/${questionId}/questionProperties/upvoteUsers/${currentUID}`).remove();
            updateUpvotes(currentUpvotes - 1);
            // TODO: Remove selected starred CSS class from the upvoteButton

        } else {

            //console.log("No data available");
            firebase.database().ref(`questions/${questionId}/questionProperties/upvoteUsers/`).child(currentUID).set("true");
            updateUpvotes(currentUpvotes + 1);
            // TODO: Add selected starred CSS class from the upvoteButton

        }
    });

    const updateUpvotes = (inputUpvotes) => {
        firebase.database().ref(`questions/${questionId}/questionProperties`)
                .update({
                    upvotes: inputUpvotes
                });
    }
};

const deleteQuestion = (questionId) => {
    firebase.database().ref(`questions/${questionId}`).remove();
    showOptions(questionId);
};

const closeEditModal = () => {
    const editQuestionModal = document.querySelector("#editQuestionModal");
    editQuestionModal.classList.toggle("is-active");
}

function addLoadEvent(func) { 
  var oldonload = window.onload; 
  if (typeof window.onload != 'function') { 
    window.onload = func; 
  } else { 
    window.onload = function() { 
      if (oldonload) { 
        oldonload(); 
      } 
      func(); 
    } 
  } 
}