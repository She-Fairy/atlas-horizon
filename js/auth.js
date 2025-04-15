// Auth state observer
firebase.auth().onAuthStateChanged((user) => {
    const loginBtn = document.getElementById('loginBtn');
    
    if (user) {
        // User is signed in
        loginBtn.textContent = 'Logout';
        loginBtn.onclick = () => firebase.auth().signOut();
    } else {
        // User is signed out
        loginBtn.textContent = 'Login with Discord';
        loginBtn.onclick = signInWithDiscord;
    }
});

// Discord authentication
function signInWithDiscord() {
    const provider = new firebase.auth.OAuthProvider('discord');
    provider.addScope('identify');
    
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            // Handle successful login
            const user = result.user;
            console.log('Logged in user:', user.displayName);
        })
        .catch((error) => {
            // Handle errors
            console.error('Auth error:', error);
            alert('Authentication failed. Please try again.');
        });
}
