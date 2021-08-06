// Initialize questionId as global variable for edit function for now. 
// We should look for a better solution, ie. bind(), but I think it's deprecated.
let questionId;
let quarumID;
let userId;

// TO-DOs:
//     IMPLEMENT SORTING ALGORITHM
//     SET DATETIME TO SPECIFIC TIME ZONE
//     FIX BROKEN EDIT/DELETE FUNCTIONALITY

// Script functions:
// addLoadEvent()
//     verifyUserAuthentication():
//     getQuarumID()

// // Initialize questionId as global variable for edit function for now. 
// // We should look for a better solution, ie. bind(), but I think it's deprecated.
// let questionId;

// User authentication when page loads
addLoadEvent(function() {
    // Verify if the user is signed in. If not, redirect to index.html
    verifyUserAuthentication();
});

// Get and diplay the Quarum ID when page loads
addLoadEvent(function() {
    // Given a search parameter ("?id=123456"), get the Quarum ID
    quarumID = getQuarumID();

    // Display the Quarum ID in the page title
    document.title = `${quarumID} — Quarum`;

    // For all items with the "quarum-id" class, display the Quarum ID
    document.querySelectorAll(".quarum-id").forEach((item) => {
        item.innerHTML = quarumID;
    })
});

// Function to get the quarum ID from the URL
const getQuarumID = () => {
    // Get the current URL.
    const queryString = window.location.search;
    
    // Get the params ("?id=123456") from the URL
    const urlParams = new URLSearchParams(queryString);

    // Get the details of the "id" parameter and return it
    const queryID = urlParams.get('id')
    return queryID;
}

// Function for user authentication.
const verifyUserAuthentication = () => {
    // Create an attached observer of the user's authentication state
    firebase.auth().onAuthStateChanged((user) => {
        // If the user is signed in, render the questions
        if (user) {
            getQuestions();
            console.log(`User signed in as: ${user.displayName}`);
            userId = user.uid;
        } else {
            // If the user is not signed in or signs out, redirect to index.html    
            window.location = 'index.html';
        }
    });
}

// Function to render questions
const getQuestions = () => {
    // Create an observer on the entire database
    // NOTE: It may be more worthwhile to attach to the specific Quarum within the database than the entire DB itself.
    const dbRef = firebase.database().ref(`quarums/${quarumID}/`);

    // Read data and render questions. 


    dbRef.child(`questions/`).orderByChild("questionProperties/upvotes/").on('value', (snapshot) => {
        //const dbData = snapshot.val();

        // Render the retireved database data
        renderQuestionAsHTML(snapshot);
    });
};

// Function to render questions and answers
const renderQuestionAsHTML = (obj) => {
    //let questions = obj.questions;
    let cards = ``;

    // NOTE: When we implement sorting functionality, we'll need to use a .forEach instead on the snapshot object
    // Additionally, we'll need to add the sorting to the data retrieval on lines 64 and 65.
    // Refer to the documentation here: https://github.com/amavalankar/FirebaseSortBy/blob/main/README.md
    // Create cards

    console.log(obj.val());

    obj.forEach((child) => {

        let questionId = child.key;

        // console.log(questionId)
        // console.log(child.val());
        // console.log(child.val().questionText);
        // console.log(child.val().submissionTime);
        // console.log(child.val().questionProperties.upvotes);
        // console.log(child.val().questionProperties.upvoteUsers);
        // console.log(child.val().answers);

        childData = child.val();

        let questions = child.val().questionText

        let answersData = child.val().answers;

        let answerTextArray = [];

        // for (const answerId in answersData) {
        //     let answerText = obj.answers[answerId].answerText;
        //     answerTextArray.push(answerText);
        // }

        for (answerIndex in answersData) {
            var answerText = "";
            var answersHtml = ``;

            firebase.database().ref(`quarums/${quarumID}/answers/${answerIndex}`).once('value').then((snapshot) => {
                answerText = snapshot.val().answerText;
                console.log(`Answer ID: ${answerIndex}`);
                console.log(`Answer Text: ${answerText}`);
                answerTextArray.push(answerText);

                answersHtml += `
                <p>${answerTextArray[i]}</p>
                <hr class="is-grey my-3">
                `;

                document.querySelector(`#${questionId}-answers`).innerHTML = answersHtml;
                
            });
            
        }

        console.log(`Answer Text Array: ${answerTextArray}`)

        cards += createCardSort(child.val(), questionId, answerTextArray);
        let dbRef = firebase.database().ref();
        dbRef.child(`users/${userId}/ownedQuestions/`).child(`${questionId}/${quarumID}`).get().then((snapshot) => {
            if (snapshot.exists()) {
                console.log("YES: ", snapshot.val());
                let editDeleteButtons = `
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
                `;
                editDeleteButtonHtml = document.querySelector(`#${questionId}-edit-delete-button-html`);
                editDeleteButtonHtml.innerHTML = editDeleteButtons;
            }
        });
    }); 
    // Render cards
    let questionCards = document.querySelector("#quarum-app");
    questionCards.innerHTML = cards;
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

    console.log(`New question value: ${newQuestion.value}`);

    // Push data
    let questionPushId = firebase.database().ref(`quarums/${quarumID}/questions`).push({
        questionText: newQuestion.value,
        submissionTime: dateTime,
        questionProperties: {
            upvotes: 1,
            upvoteUsers: { 
                [firebase.auth().currentUser.uid]: true
            }
        }
    });

    // Push user questionId
    let questionKey = questionPushId.getKey();
    firebase.database().ref(`users/${userId}/ownedQuestions/`).update({
        [questionKey]: {
            [quarumID]: true
        }
    });

    // // Push data
    // firebase.database().ref('questions').push({
    //     questionText: newQuestion.value,
    //     submissionTime: dateTime,
    //     questionProperties: {
    //         upvotes: 0
    //     }
    // });

    newQuestion.value = "";
};

// Function to submit answer
let submitAnswer = (questionId) => {
    let newAnswer = document.querySelector(`#${questionId}-new-answer`);

    // Add timestamp
    let submissionTimestamp = new Date();
    date = submissionTimestamp.getFullYear()+'-'+(submissionTimestamp.getMonth()+1)+'-'+submissionTimestamp.getDate();
    time = submissionTimestamp.getHours() + ":" + submissionTimestamp.getMinutes() + ":" + submissionTimestamp.getSeconds();
    let dateTime = date+' '+time;

    // Push answer
    // let answerPushId = firebase.database().ref('answers').push({
    let answerPushId = firebase.database().ref(`quarums/${quarumID}/answers`).push({
        answerText: newAnswer.value,
        submissionTime: dateTime,
        answerProperties: {
            upvotes: 0
        }
    })

    // Push answerKey
    let answerKey = answerPushId.getKey();
    // firebase.database().ref(`questions/${questionId}/answers`).update({
    firebase.database().ref(`quarums/${quarumID}/questions/${questionId}/answers`).update({
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
                <p class="is-size-5"><b>${questions}</b></p>
                            <a class="star one-line" onclick="upvoteQuestion('${questionId}', ${questionId.questionProperties.upvotes})" id="${questionId}-upvoteButton">${questionId.questionProperties.upvotes} <i class="far fa-star"></i></a>
                        </div>

                        <div class="message-header has-text-grey pt-1 pb-2">
                            <p><time datetime="2016-1-1">${questionId.submissionTime}</time></p>
                            <div id="${questionId}-edit-delete-button-html">
                            </div>
                        </div>

                        <div class="message-body">
                            <div id="${questionId}-answers"></div>

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

// Function to create card
const createCardSort = (questionObject, questionKey, answerTextArray) => {
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
                <p class="is-size-5"><b>${questionObject.questionText}</b></p>
                            <a class="star one-line" onclick="upvoteQuestion('${questionKey}', ${questionObject.questionProperties.upvotes})" id="${questionKey}-upvoteButton">${questionObject.questionProperties.upvotes} <i class="far fa-star"></i></a>
                        </div>

                        <div class="message-header has-text-grey pt-1 pb-2">
                            <p><time datetime="2016-1-1">${questionObject.submissionTime}</time></p>
                            <div id="${questionKey}-edit-delete-button-html">
                            </div>
                        </div>

                        <div class="message-body">
                            ${answersHtml}

                            <div class="field has-addons mt-4">
                                <div class="control is-expanded">
                                    <input class="input is-rounded" type="text" placeholder="Answer question" id="${questionKey}-new-answer">
                                </div>

                                <div class="control">
                                    <button class="button brand-color-fill is-rounded" id="${questionKey}-submit-answer" onclick="submitAnswer('${questionKey}')">Submit</button>
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

// Function to edit questions
const editQuestion = (questionId) => {
    const editQuestionModal = document.querySelector("#editQuestionModal");
    editQuestionModal.classList.toggle("is-active");

    // Display current question in edit question bar
    // firebase.database().ref(`/questions/${questionId}/questionText`).once('value').then((snapshot) => {
    firebase.database().ref(`quarums/${quarumID}/questions/${questionId}/questionText`).once('value').then((snapshot) => {
        let oldQuestion = snapshot.val();
        console.log(oldQuestion);
        let inputField = document.querySelector("#editQuestionInput");
        inputField.value = oldQuestion;
    });

    // // Get the text from the note in the database
    // const notesRef = firebase.database().ref(`users/${googleUserId}/${noteId}`);
    // notesRef.on('value', snapshot => {
    //     const data = snapshot.val();
        
    //     document.querySelector("#editTitleInput").value = data.title;
    //     document.querySelector("#editTextInput").value = data.note;
    // });

    // Event listener for saving question
    const saveButton = document.querySelector("#save-button");
    // saveButton.addEventListener("click", (event) => {
    //     let newQuestionText = document.querySelector("#editQuestionInput").value;
    //     console.log(newQuestionText);
    //     firebase.database().ref(`questions/${questionId}`)
    //         .update({
    //             questionText: newQuestionText
    //         });
    //     document.querySelector("#editQuestionInput").value = '';
    //     closeEditModal();
    // });

    saveButton.onclick = () => {
        let newQuestionText = document.querySelector("#editQuestionInput").value;
        // firebase.database().ref(`questions/${questionId}`)
        firebase.database().ref(`quarums/${quarumID}/questions/${questionId}`)
            .update({
                questionText: newQuestionText
            });
        document.querySelector("#editQuestionInput").value = '';
        closeEditModal();
    };

    showOptions(questionId);
};

// Upvote question function
const upvoteQuestion = (questionId, currentUpvotes) => {

    upvoteButton = document.querySelector(`#${questionId}-upvoteButton`);
    currentUID = firebase.auth().currentUser.uid;

    // firebase.database().ref(`questions/${questionId}/questionProperties/upvoteUsers/${currentUID}`).get().then((snapshot) => {
    firebase.database().ref(`quarums/${quarumID}/questions/${questionId}/questionProperties/upvoteUsers/${currentUID}`).get().then((snapshot) => {

        if (snapshot.exists()) {

            //console.log(`User of UID: ${currentUID} is found in upvotes`);
            // firebase.database().ref(`questions/${questionId}/questionProperties/upvoteUsers/${currentUID}`).remove();
            firebase.database().ref(`quarums/${quarumID}/questions/${questionId}/questionProperties/upvoteUsers/${currentUID}`).remove();
            updateUpvotes(currentUpvotes - 1);
            // TODO: Remove selected starred CSS class from the upvoteButton

        } else {

            //console.log("No data available");
            // firebase.database().ref(`questions/${questionId}/questionProperties/upvoteUsers/`).child(currentUID).set("true");
            firebase.database().ref(`quarums/${quarumID}/questions/${questionId}/questionProperties/upvoteUsers/`).child(currentUID).set("true");
            updateUpvotes(currentUpvotes + 1);
            // TODO: Add selected starred CSS class from the upvoteButton

        }
    });

    const updateUpvotes = (inputUpvotes) => {
        // firebase.database().ref(`questions/${questionId}/questionProperties`)
        firebase.database().ref(`quarums/${quarumID}/questions/${questionId}/questionProperties`)
                .update({
                    upvotes: inputUpvotes
                });
    }
};

// Function to delete questions
const deleteQuestion = (questionId) => {
    // firebase.database().ref(`questions/${questionId}`).remove();
    userUID = firebase.auth().currentUser.uid

    firebase.database().ref(`quarums/${quarumID}/questions/${questionId}`).remove();
    firebase.database().ref(`users/${userUID}/ownedQuestions/${questionId}`).remove();    
    showOptions(questionId);
};

// Close modal
const closeEditModal = () => {
    const editQuestionModal = document.querySelector("#editQuestionModal");
    editQuestionModal.classList.toggle("is-active");
}

// addLoadEvent: function that — when given a function — adds it to a queue of functions that loads when the page loads.
// The function itself, which can be ignored, is at the bottom of this file. Be sure not to edit or remove it! :D
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