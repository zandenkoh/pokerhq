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

// DOM elements
const container = document.getElementById('container');
const embedContainer = document.getElementById('embedContainer');
const embedFrame = document.getElementById('embedFrame');
const popup = document.getElementById('popup');
const embedInput = document.getElementById('embedInput');
const submitLink = document.getElementById('submitLink');

// Keys required to open the popup
const requiredKeys = ['1', '2', '3', 'j', 'k'];
let pressedKeys = new Set();

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

// Detect simultaneous key presses
window.addEventListener('keydown', (e) => {
    pressedKeys.add(e.key); // Add key to the set

    // Check if all required keys are pressed
    if (requiredKeys.every(key => pressedKeys.has(key))) {
        showPopup(); // Show the popup
        pressedKeys.clear(); // Clear pressed keys after popup is shown
    }
});

// Detect when keys are released to remove them from the set
window.addEventListener('keyup', (e) => {
    pressedKeys.delete(e.key); // Remove key from the set
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
