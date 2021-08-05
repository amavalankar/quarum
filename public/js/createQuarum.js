addLoadEvent(function() {
    verifyUserAuthentication();
});

const verifyUserAuthentication = () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log(`User signed in as: ${user.displayName}`);
            //console.log(user);
        } else {
            window.location = 'index.html';
        }
    });
}

const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

const createQuarum = () => {
    submitButton = document.querySelector("#createSubmitButton");
    if(!submitButton.classList.contains('is-loading')) submitButton.classList.add('is-loading');

    inputField = document.querySelector("#quarumName");
    alertBanner = document.querySelector("#alertBanner");

    if(!alertBanner.classList.contains('is-hidden')) alertBanner.classList.add('is-hidden');
    if(inputField.classList.contains('is-danger')) inputField.classList.remove('is-danger');

    inputName = inputField.value;
    
    if(inputName) {
        var quarumCode = generateRandomCode();
        //var quarumCode = 123456;
        console.log(quarumCode);

        var ref = firebase.database().ref("quarums/");
        ref.once("value").then(function(snapshot) {

            var doesExist = snapshot.child(quarumCode).exists();

            console.log(`The input ID of ${quarumCode} resolves as ${doesExist} in the database`);

            if(!doesExist) {
                console.log(`Created Quarum with ID of ${quarumCode} in the DB`)
                firebase.database().ref(`quarums/${quarumCode}/`).set({
                    quarumProperties: {
                        quarumName: inputName,
                        quarumOwner: firebase.auth().currentUser.uid
                    }
                }).then(() => {
                    quarumPage = "/quarum.html";
                    quarumURL = `${quarumPage}?id=${quarumCode}`;
                    console.log(`Init URL: ${quarumURL}`);
                    window.location = quarumURL;
                });
            } else {
                createQuarum();
            }
        });

        // Get data from Firebase, and check if the desired ID exists in the quarums list.
        var ref = firebase.database().ref("quarums/");
        ref.once("value").then(function(snapshot) {

            var doesExist = snapshot.child(quarumCode).exists();
            
            console.log(doesExist);
        });

        


    } else {
        // Field left blank — send error message to user
        submitButton.classList.remove("is-loading");

        alertBanner.classList.remove('is-hidden');
        inputField.classList.add("is-danger");
    }

    submitButton.classList.remove("is-loading");
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