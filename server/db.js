const admin = require("firebase-admin");

// Firebase Admin setup
function initializeFirebase() {
    if (admin.apps.length > 0) {
        return admin.firestore();
    }

if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        })
    });

    return admin.firestore();
}

    const serviceAccount = require("../firebase-service-account.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    return admin.firestore();
}

const db = initializeFirebase();

// Save message to Firestore
async function saveMessage(messageData) {
    const messageToSave = {
        chatId: messageData.chatId,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        chatType: messageData.chatType,
        receiverId: messageData.receiverId || null,
        roomId: messageData.roomId || null,
        messageText: messageData.messageText,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    const savedMessage = await db.collection("messages").add(messageToSave);

    return {
        id: savedMessage.id,
        ...messageToSave,
        timestamp: new Date().toISOString()
    };
}

// Load last 50 messages
async function loadChatHistory(chatData) {
    const snapshot = await db
        .collection("messages")
        .where("chatId", "==", chatData.chatId)
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();

    return snapshot.docs
        .map(function (doc) {
            const data = doc.data();

            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString()
            };
        })
        .reverse();
}

module.exports = {
    db,
    saveMessage,
    loadChatHistory
};