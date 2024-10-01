// Firebase config (Replace with your Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyCXNoXZDzAaFKnX-BY7d_dS09fLxlIzAQ0",
    authDomain: "poker-hq.firebaseapp.com",
    projectId: "poker-hq",
    storageBucket: "poker-hq.appspot.com",
    messagingSenderId: "968470349230",
    appId: "1:968470349230:web:15f3c021ce9a6bdd10b43f"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Variables for key sequence detection
let keySequence = [];
const secretKey = ["1", "2", "3", "0", "9", "8"]; // The exact key sequence
const maxSequenceLength = secretKey.length; // Max length of the sequence

// DOM elements
const container = document.getElementById('container');
const embedContainer = document.getElementById('embedContainer');
const embedFrame = document.getElementById('embedFrame');
const popup = document.getElementById('popup');
const embedInput = document.getElementById('embedInput');
const submitLink = document.getElementById('submitLink');

// Function to check the current display status in Firebase
function checkEmbedStatus() {
    const ref = firebase.database().ref('embeds');
    
    ref.once('value', (snapshot) => {
        let activeNode = null;
        snapshot.forEach(childSnapshot => {
            const childData = childSnapshot.val();
            if (childData.display === true) {
                activeNode = childData;
            }
        });

        if (activeNode) {
            showEmbed(activeNode.link);
        } else {
            showNoLobby();
        }
    });

    // Set up real-time listener
    ref.on('value', (snapshot) => {
        let activeNode = null;
        snapshot.forEach(childSnapshot => {
            const childData = childSnapshot.val();
            if (childData.display === true) {
                activeNode = childData;
            }
        });

        if (activeNode) {
            showEmbed(activeNode.link);
        } else {
            showNoLobby();
        }
    });
}

// Show the embed iframe
function showEmbed(link) {
    container.style.display = 'none';
    embedContainer.style.display = 'block';
    embedFrame.src = link;
}

// Show "No Poker Lobbies Found" message
function showNoLobby() {
    embedContainer.style.display = 'none';
    container.style.display = 'block';
}

// Detect the exact secret key sequence
window.addEventListener('keydown', (e) => {
    keySequence.push(e.key);  // Add the pressed key to the sequence

    // If the sequence becomes longer than the secret key, remove the oldest key
    if (keySequence.length > maxSequenceLength) {
        keySequence.shift();
    }

    // Check if the current keySequence matches the secretKey exactly
    if (keySequence.join('') === secretKey.join('')) {
        showPopup();  // Show the popup when the exact sequence is entered
        keySequence = [];  // Reset the sequence
    }
});

// Show the popup for inputting embed link
function showPopup() {
    popup.style.display = 'block';
}

// Hide the popup and save the embed link to Firebase
submitLink.addEventListener('click', () => {
    const embedLink = embedInput.value;

    if (embedLink) {
        // Hide the popup
        popup.style.display = 'none';
        
        // Save the embed link to Firebase
        const ref = firebase.database().ref('embeds');
        
        // Set all past nodes to display: false
        ref.once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                ref.child(childSnapshot.key).update({ display: false });
            });

            // Add new node with display: true
            ref.push({
                link: embedLink,
                display: true
            });
        });

        // Clear input field
        embedInput.value = '';
    }
});

// Initial check for embed status on page load
checkEmbedStatus();
