// Initialize questionId as global variable for edit function for now. 
// We should look for a better solution, ie. bind(), but I think it's deprecated.
let questionId;
let quarumID;
let userId;

localStorage.setItem("sortMethod", "recent");

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

    quarumID = getQuarumID();

    verifyQuarum(quarumID);
    
});

const verifyQuarum = (inputId)=> {
    var ref = firebase.database().ref("quarums/");
    ref.once("value").then(function(snapshot) {

        var doesExist = snapshot.child(inputId).exists();

        console.log(`The input ID of ${inputId} resolves as ${doesExist} in the database`);

        if(!doesExist) {
            //console.log(`Send gatekeep Quarum popup`);
            joinModal = document.querySelector("#joinQuarumModal");
            joinModal.classList.add("is-active");
        }
    });
}

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
            getQuestions(localStorage.getItem("sortMethod"));
            console.log(`User signed in as: ${user.displayName}`);
            userId = user.uid;
        } else {
            // If the user is not signed in or signs out, redirect to index.html    
            //window.location = 'index.html';

            redirectSignInModal = document.querySelector("#signInModal");
            redirectSignInModal.classList.add("is-active")
        }
    });
}

// Function to render questions
const getQuestions = (sortMethod) => {

    // console.log(sortMethod);

    var sortQuery = "";
    var doInverse = false;

    switch(sortMethod) {
        case "recent":
            // console.log(`Sort by recent`);
            doInverse = true;
            sortQuery = "submissionTime/"
            break;
        case "oldest":
            //console.log(`Sort by oldest`);
            sortQuery = "submissionTime/"
            break;
        case "most-upvotes":
            // console.log(`Sort by most-upvotes`);
            doInverse = true;
            sortQuery = "questionProperties/upvotes/"
            break;
        case "least-upvotes":
            //console.log(`Sort by least-upvotes`);
            sortQuery = "questionProperties/upvotes/"
            break;
        // case "most-answers":
        //     console.log(`Sort by recent`);
        //     break;
        // case "least-answers":
        //     console.log(`Sort by recent`);
        //     break;
    }

    // Create an observer on the entire database
    // NOTE: It may be more worthwhile to attach to the specific Quarum within the database than the entire DB itself.
    const dbRef = firebase.database().ref(`quarums/${quarumID}`);

    // Read data and render questions. 
    dbRef.on('value', (snapshot) => {
        const dbData = snapshot.val();
        // console.log(dbData);
        // dbData is the entire database at the quarumID level.

        dbRef.child(`/questions`).orderByChild(sortQuery).once('value', (sortedSnapshot) => {

            // console.log(sortedSnapshot.val());

            // sortedSnapshot is a snapshot of the QUESTIONS sorted by the search query.
            var sortedArray = [];

            // If needed, invert the values.
            // Regardless, push questions into an array.

            sortedSnapshot.forEach((newChild) => {
                sortedArray.push(newChild.key);
            });

            if(doInverse) { sortedArray.reverse(); }

            //for(item in sortedArray) { console.log(`Array key: ${sortedArray[item]}`); }

            // sortedSnapshot.forEach((newChild) => {

            //     currentUID = firebase.auth().currentUser.uid;

            //     // userQuestions = firebase.database().ref(`users/${currentUID}`).get();
            //     // if(userQuestions.exists(newChild.key)) { console.log(`Owner = true`); }

            //     console.log(`Question owner: ${newChild.val().questionProperties.owner}`)
            //     console.log(newChild.val());

            //     for(answerKeyLocal in newChild.val().answers) {
            //         console.log(dbData.answers[answerKeyLocal].answerText);
            //     }
            // })

            // Render the retireved database data
            renderQuestionAsHTML(dbData, sortedArray);
        })

        
    });
};

// Function to render questions and answers
const renderQuestionAsHTML = (obj, questionsArray) => {

    let cardsHTML = ``;
    // console.log(obj)
    // console.log(obj.questions);

    for(key in questionsArray) {
        let questionKey = questionsArray[key];``
        let questionObject = obj.questions[questionKey];

        // console.log(questionObject);
        // console.log(isQuestionOwner);
        // console.log(questionKey);

        let answersData = questionObject.answers;
        let answerTextArray = [];
        for (const answerId in answersData) {
            let answerText = obj.answers[answerId].answerText;
            answerTextArray.push(answerText);
        }

        cardsHTML += createCard(questionKey, questionObject, answerTextArray);
        
    }
    ``
    // Render cards
    let questionCards = document.querySelector("#quarum-app");
    questionCards.innerHTML = cardsHTML;

    if(cardsHTML == ``) { 
        noQuestionMessage = `
        <h2 class="title has-text-centered mt-2 mb-0 has-text-grey">
            <i class="fas fa-bullhorn"></i>
        </h2>
        <h2 class="title mt-2 mb-2 has-text-centered has-text-grey">No questions have been asked.</h2>
        <h2 class="subtitle mb-3 mt-2 has-text-centered has-text-grey">Maybe you could be the first?</h2>
        `;
        questionCards.innerHTML = noQuestionMessage;
        console.log('No questions') 
    }
};

// Function to submit question
const submitQuestion = () => {
    let SubmitQuestionButton = document.querySelector("#submit-question");
    let newQuestion = document.querySelector("#new-question");

    // Add timestamp
    let submissionTimestamp = Date.now();
    // date = submissionTimestamp.getFullYear()+'-'+(submissionTimestamp.getMonth()+1)+'-'+submissionTimestamp.getDate();
    // time = submissionTimestamp.getHours() + ":" + submissionTimestamp.getMinutes() + ":" + submissionTimestamp.getSeconds();
    // let dateTime = date+' '+time;

    // console.log(`New question value: ${newQuestion.value}`);

    // Push data
    let questionPushId = firebase.database().ref(`quarums/${quarumID}/questions`).push({
        questionText: newQuestion.value,
        submissionTime: submissionTimestamp,
        questionProperties: {
            owner: [firebase.auth().currentUser.uid],
            numberOfAnswers: 0,
            upvotes: 0
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
    });

    // Push answerKey
    let answerKey = answerPushId.getKey();
    // firebase.database().ref(`questions/${questionId}/answers`).update({
    firebase.database().ref(`quarums/${quarumID}/questions/${questionId}/answers`).update({
        [answerKey]: true
    });
};


// Function to create card
const createCard = (questionId, questionObject, answerTextArray) => {

    var isQuestionOwner = false;

    userUID = firebase.auth().currentUser.uid;

    if(questionObject.questionProperties.owner == userUID) { isQuestionOwner = true; }

    var hasUserUpvote = false;
    try {
        if(userUID in questionObject.questionProperties.upvoteUsers) { 
            //console.log(`Current user has upvoted this question!`);
            hasUserUpvote = true;
        }
    } catch(e) {
        // console.log(e);
    }

    var upvoteIcon = "far fa-star"
    var upvoteColorClass = "star"

    if(hasUserUpvote) {
        upvoteIcon = "fas fa-star"
        upvoteColorClass = "star brand-color-text"
    } 

    let answersHtml = ``;
    for(answerKey in answerTextArray) {
        answersHtml += `
        <p>${answerTextArray[answerKey]}</p>
        <hr class="is-grey my-3">
        `;
    }

    var editDeleteButtons = ``;

    //console.log(`isQuestionOwner: ${isQuestionOwner}`);

    if (isQuestionOwner) {
        editDeleteButtons = `
        <div class="dropdown is-right" id="${questionId}-dropdown">
            <div class="dropdown-trigger">
                <a class="icon is-small" onclick="showOptions('${questionId}')" aria-haspopup="true" aria-controls="dropdown-menu">
                    <i class="fas fa-ellipsis-h"></i>
                </a>
            </div>
                    
            <div class="dropdown-menu" id="dropdown-menu" role="menu">
                <div class="dropdown-content">
                    <a class="dropdown-item" onclick="editQuestion('${questionId}')">Edit</a>
                    <a class="dropdown-item" onclick="deleteQuestion('${questionId}')">Delete</a>
                </div>
            </div>
        </div>`;
    }
    
    let renderedDateTime = renderDate(questionObject.submissionTime);
    return `
    <div class="my-4">
        <article class="message is-light">
            <div class="message-header pb-1">
                <p class="is-size-5"><b>${questionObject.questionText}</b></p>
                <a class="${upvoteColorClass} one-line" onclick="upvoteQuestion('${questionId}', ${questionObject.questionProperties.upvotes})" id="${questionId}-upvoteButton">${questionObject.questionProperties.upvotes} <i class="${upvoteIcon}"></i></a>
            </div>

            <div class="message-header has-text-grey pt-1 pb-2">
                <p><time datetime="2016-1-1">${renderedDateTime}</time></p>
                <div id="${questionId}-edit-delete-button-html">
                    ${editDeleteButtons}
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
        //console.log(oldQuestion);
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
    firebase.database().ref(`quarums/${quarumID}/questions/${questionId}`).remove();
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

function ReverseObject(Obj){
    var TempArr = [];
    var NewObj = [];
    for (var Key in Obj){
        TempArr.push(Key);
    }
    for (var i = TempArr.length-1; i >= 0; i--){
        NewObj[TempArr[i]] = [];
    }
    return NewObj;
}

const returnHome = () => {
    window.location = 'index.html'
}

const sortCards = () => {

    sortButton = document.querySelector("#sort-button");
    selectedValue = sortButton.options[sortButton.selectedIndex].getAttribute("value");

    //console.log(`Sort called. Value: ${selectedValue}`);

    localStorage.setItem("sortMethod", selectedValue);
    //console.log(localStorage.getItem("sortMethod"));

    getQuestions(localStorage.getItem("sortMethod"));
}

const renderDate = (inputTimestamp) => {
    var date = new Date(inputTimestamp); 
    const month = date.toLocaleString('default', { month: 'short' });
    
    var outputString = `${month} ${date.getDate()}, ${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}`;
    return outputString;
}