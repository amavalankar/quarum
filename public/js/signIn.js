addLoadEvent(function() {
    const accountButton = document.querySelector("#accountButton");
    const signedInDropdown = document.querySelector("#dropdownMenuSignedIn");
    const signedOutDropdown = document.querySelector("#dropdownMenuSignedOut");

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            console.log(`Signed in as: ${firebase.auth().currentUser}`);
            accountButton.innerHTML = "Sign Out";
            //accountButton.classList.remove("is-loading");
            removeLoadingState();
            accountButton.setAttribute("onclick", "signOut()");

            signedInDropdown.classList.remove("is-hidden");

        } else {
            
            console.log("User not currently signed in...");
            accountButton.innerHTML = "Sign In";
            //accountButton.classList.remove("is-loading");
            removeLoadingState();
            accountButton.setAttribute("onclick", "toggleSignInModal()");

            signedOutDropdown.classList.remove("is-hidden");

        }
    });
});

const toggleUserIcon = () => {
    dropdownMenu = document.querySelector("#accountOptions");
    accountOptions.classList.toggle("is-active");
}

const removeLoadingState = () => {

    document.querySelectorAll(".is-loading").forEach(item => {
        item.classList.remove("is-loading");
        item.innerHTML += "";
        // Add an empty string to force refresh the button because some browsers seem to have a hard time when we remove the is-loading class.
    });
}

const newQuarum = () => {

    if(firebase.auth().currentUser) {

        console.log(`Signed in as: ${firebase.auth().currentUser}`);
            window.location = "/new-quarum.html"

    } else {

        console.log("User not currently signed in...");
        toggleSignInModal();

    }

    // firebase.auth().onAuthStateChanged(function(user) {
    //     if (user) {

    //         console.log(`Signed in as: ${firebase.auth().currentUser}`);
    //         //console.log("TODO: Redirect to configuration page");
    //         window.location = "/quarum.html"

    //     } else {
            
    //         console.log("User not currently signed in...");
    //         toggleSignInModal();

    //     }
    // });
}

const joinQuarum = () => {

    toggleJoinQuarumModal();
}

const toggleSignInModal = () => {

    if(firebase.auth().currentUser) {

        console.log(`Action ignored, user is already signed in`);

    } else {

        signInModal = document.querySelector("#signInModal");
        signInModal.classList.toggle("is-active");

    }

    // firebase.auth().onAuthStateChanged(function(user) {

    //     if (user) {

    //         console.log(`Action ignored, user is already signed in`);

    //     } else {
    //         signInModal = document.querySelector("#signInModal");
    //         signInModal.classList.toggle("is-active");

    //     }
    // });
    
}

const doJoinQuarum = () => {
    idInput = document.querySelector("#joinQuarumInput");
    inputText = idInput.value;

    if(!inputText) inputText = "no-key";
    // Add default value to text — if none presented — to avoid an error when querying Firebase

    // Hide the error alert to avoid confusion for the user.
    errorAlert = document.querySelector("#quarumNotFoundAlert");
    if(!errorAlert.classList.contains('is-hidden')) errorAlert.classList.add('is-hidden');
    if(idInput.classList.contains('is-danger')) idInput.classList.remove('is-danger');

    // Add loading state to the buttons to prevent additional actions while fetching data from Firebase
    joinQuarumButton = document.querySelector("#joinQuarumButton");
    cancelButton = document.querySelector("#cancelJoinButton");

    joinQuarumButton.classList.add("is-loading");
    cancelButton.classList.add("is-loading");
    
    console.log(`Input ID: ${inputText}`);

    // Get data from Firebase, and check if the desired ID exists in the quarums list.
    var ref = firebase.database().ref("quarums/");
    ref.once("value").then(function(snapshot) {
        removeLoadingState();
        // Remove the loading indicators from the icons now that everything is loaded.

        var doesExist = snapshot.child(inputText).exists();

        console.log(`The input ID of ${inputText} resolves as ${doesExist} in the database`);

        if(doesExist === true) {

            quarumPage = "/quarum.html";
            quarumURL = `${quarumPage}?id=${inputText}`;
            console.log(`Init URL: ${quarumURL}`);
            window.location = quarumURL;

        } else {
            errorAlert.classList.remove('is-hidden');
            idInput.classList.add("is-danger");
        }
    });
}

const toggleJoinQuarumModal = () => {

    joinQuarumModal = document.querySelector("#joinQuarumModal");

    if(firebase.auth().currentUser) {
        joinQuarumModal.classList.toggle("is-active");
    } else {
        toggleSignInModal();
    }
    
    // firebase.auth().onAuthStateChanged(function(user) {
    //     if (user) {

    //         joinQuarumModal.classList.toggle("is-active");

    //     } else {
            
    //         toggleSignInModal();
    //             // .then((response) => {
    //             //     firebase.auth().onAuthStateChanged(function(user) {
    //             //         if (user) {
    //             //             joinQuarumModal.classList.toggle("is-active"); 
    //             //         } 
    //             //         else {
    //             //             console.log("Please sign in to join a Quarum.");
    //             //         }
    //             //     });
    //             // });
    //     }
    // });
    
}

const signIn = () => {
  var provider = new firebase.auth.GoogleAuthProvider();
  // console.log(provider)
  firebase.auth()
  .signInWithPopup(provider)
  .then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;
    var token = credential.accessToken;

    // The signed-in user info.
    var user = result.user;
    console.log(`User ID: ${user.uid}`);

    //toggleSignInModal();
    signInModal = document.querySelector("#signInModal");
    signInModal.classList.remove("is-active");

  }).catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    const err = {
      errorCode,
      errorMessage,
      email,
      credential
    };
    console.log(err);
  });
}

const signOut = () => {
    firebase.auth().signOut().then(() => {
        location.reload();
    }).catch((error) => {
        console.log(`We encountered an error trying to sign out: ${error}`);
    });
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