window.onload = (event) => {

    const accountButton = document.querySelector("#accountButton");
    const signedInDropdown = document.querySelector("#dropdownMenuSignedIn");
    const signedOutDropdown = document.querySelector("#dropdownMenuSignedOut");

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            console.log(`Signed in as: ${firebase.auth().currentUser}`);
            accountButton.innerHTML = "Sign Out";
            accountButton.classList.remove("is-loading");
            accountButton.setAttribute("onclick", "signOut()");

            signedInDropdown.classList.remove("is-hidden");

        } else {
            
            console.log("User not currently signed in...");
            accountButton.innerHTML = "Sign In";
            accountButton.classList.remove("is-loading");
            accountButton.setAttribute("onclick", "toggleSignInModal()");

            signedOutDropdown.classList.remove("is-hidden");

        }
    });

}

const newQuarum = () => {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            console.log(`Signed in as: ${firebase.auth().currentUser}`);
            //console.log("TODO: Redirect to configuration page");
            window.location = "/quarum.html"

        } else {
            
            console.log("User not currently signed in...");
            toggleSignInModal();

        }
    });
}

const joinQuarum = () => {

}

const toggleSignInModal = () => {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            console.log(`Action ignored, user is already signed in`);
        } else {
            signInModal = document.querySelector("#signInModal");
            signInModal.classList.toggle("is-active");
        }
    });
    
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
    toggleSignInModal()
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