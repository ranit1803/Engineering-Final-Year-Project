//remove start
const firebaseConfig = {
    apiKey: "AIzaSyDN1lg6vG4lpc_XqE4Fp9NjmTMKL8TZ1Zg",
    authDomain: "finalprojcopy.firebaseapp.com",
    projectId: "finalprojcopy",
    storageBucket: "finalprojcopy.firebasestorage.app",
    messagingSenderId: "1016618630409",
    appId: "1:1016618630409:web:79bdbfbaaf4fc20ce1a7d8",
    measurementId: "G-5ZLQ06YMH5"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

//remove end

//dom elements
const loginbtn = document.querySelector("#login");
const registerbtn = document.querySelector("#register");
const loginform = document.querySelector(".login-form");
const registerform = document.querySelector(".registration-form");

//remove start
const loginEmail = document.querySelector("#login-email");
const loginPassword = document.querySelector("#login-password");
const loginBtn = document.querySelector("#login-btn");
const signupName = document.querySelector("#signup-name");
const signupEmail = document.querySelector("#signup-email");
const signupPassword = document.querySelector("#signup-password");
const signupBtn = document.querySelector("#signup-btn");
const socialIcons = document.querySelectorAll(".social-login i");
//remove end

loginbtn.addEventListener("click", () => {
    loginbtn.style.backgroundColor = "#6e5168";
    registerbtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";

    loginform.style.left = "50%";
    registerform.style.left = "-50%";

    loginform.style.opacity = 1;
    registerform.style.opacity = 0;

    document.querySelector(".col-1").style.borderRadius = "0 30% 20% 0";
})

registerbtn.addEventListener("click", () => {
    loginbtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    registerbtn.style.backgroundColor = "#6e5168";
    loginform.style.left = "150%";
    registerform.style.left = "50%";

    loginform.style.opacity = 0;
    registerform.style.opacity = 1;

    document.querySelector(".col-1").style.borderRadius = "0 20% 30% 0";
})

//remove start

//email signup
// Update your signupBtn event listener:
let registrationInProgress = false;

// When user clicks on Register
signupBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    registrationInProgress = true;

    const email = signupEmail.value;
    const password = signupPassword.value;
    const displayName = signupName.value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName });
        await auth.signOut();

        alert("Registration successful! Please sign in.");
        registrationInProgress = false;

        loginbtn.click();
        loginEmail.value = email;
        loginPassword.value = "";

    } catch (error) {
        registrationInProgress = false;
        alert("Registration failed: " + error.message);
    }
});

// Only redirect on login if user is not in registration flow
auth.onAuthStateChanged((user) => {
    if (user && !registrationInProgress) {
        window.location.href = "/pages/slider/slider.html";
    }
});



// Email/Password Sign In
loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const email = loginEmail.value;
    const password = loginPassword.value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Redirect to home page
            window.location.href = "/pages/slider/slider.html";
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Forgot Password
document.querySelector(".forgot-pass a").addEventListener("click", (e) => {
    e.preventDefault();
    const email = prompt("Please enter your email address to reset your password:");
    
    if (email) {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert("Password reset email sent. Please check your inbox.");
            })
            .catch((error) => {
                alert(error.message);
            });
    }
});

//social media login
socialIcons.forEach(icon => {
    icon.style.cursor = "not-allowed";
    if (!icon.classList.contains("bxl-google")) {
        icon.addEventListener("click", () => alert("Only Google login is supported currently."));
    } else {
        icon.addEventListener("click", () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider)
                .then(() => {
                    window.location.href = "/pages/slider/slider.html";
                })
                .catch((error) => {
                    alert("Google Sign-In Error: " + error.message);
                });
        });
    }
});


// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, redirect to home page
        window.location.href = "/pages/slider/slider.html";
    }
});
//remove end






