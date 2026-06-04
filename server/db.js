const admin = require("firebase-admin");

// Firebase Admin setup
function initializeFirebase() {
    if (admin.apps.length > 0) {
        return admin.firestore();
    }

    if (
        process.env.chat-application-socketio &&
        process.env.firebase-adminsdk-fbsvc@chat-application-socketio.iam.gserviceaccount.com &&
        process.env.-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDCk1Ru/UamAbMJ\nT1h48yGAOEAIcvIi6qulUPO1H5AxaD3KUeCbx26vgfxI8AAogqNQC1x86bnyPxI+\n9UxuBfGjAlClij/tXPPSFjB362kbzDRQdWEkFtcuwVCu/jUARe8S+deCJPIq+2MI\nxFvt+wYeUADIsrA6ryIWZKEBrkhWryED0WCtieBFnDNcNrn2KGXn/LuXTbXNWYUN\n4U7R95YpY3RQzJVqeL+2dHRmiOib4ISQuXbipEgAygGjQZdID9iZRzezjJz8NtYe\n0qms5+JzVICEaWurZ+3PT24wAf2DWSM2yr7Km+fNZtFxFAx6erWj8xNhe/JYsj+V\nXXmQDeO9AgMBAAECggEABX7ZxKS8qRWlM98c1ZWwXYm5LUPp2Nid7nZh27y/etXB\n4QP8/wlb8/MM6BZ3Oq2t5SXc/94uFUx4vHR7KyRZ1cvL8VD9Szvz2vwrdEee2V0k\nIR2fl8BZZYWqPLcLUi2nefa6gn9+o34kJuw82HTdkF+cFg8N8SpfIRjIf16nxmLx\nQXZ1CUGOm/sLjwzFjvhIDDAvMCofvm+cl2oOi0ChuRg+3Zop9GW/jFuJFVmFkRi4\nUf4H4TEZgk1tD0M8fG6CqgB5S2SHXTeuzS7I+VZp22lUrkcYBX6aOa3SNYs34Atu\ndP79DBU2LYwoXYle4mVTXzp/sdtF7WRwrH1e5/Xp1QKBgQDqW0Lt6m+Otu1RLFwR\nAODDiqJkItoabdR/4NBlv938oIPb4DpoOyiXNl4pHVaa1I6iY5SK1UmPGIO17z6S\nRG52ER/l/ouCDXxacee89RAwH6RCZEv1doQ5WPsabe0Ynv7KgRSdVZYknBdKs8Fb\nOJzjo0nCIgiMdKem5Yv5CtsxcwKBgQDUi41pQkKVY9tXu1tWJmZV0VuIx/GdO1+J\nQJ2SLFp3sCfvCfIVCteQoNp8Zkt8k/g0gbzMEsBHTe/OTgqF0h5Cg0s8tA+FvO7C\nXgDkrfgryB02kqliNaIMqTf9i2R/wXU/EIPrpatqBSU3rBJSsJ5e/uGeGHQekoed\nH0jxDbqKDwKBgQDQ4pMfWGwium2Agpd1GGE+KV1g/6eDEw3rBUj6yC9msvOUkaG9\nsa0WSoFXCC1fR8Hyf+uwazdrciBDk4EkAhaq6cySxXU3cCm8u/Yf+BZ7rlhMTPVf\nTknAi80U25IO9fiIKtFjAxwWeYJRNTNMyYMdazec75TLDFc6bTN7wO9qfQKBgFQ8\nsuECx8zZdLdCpCJyuaBNh0+gntvICkcles3SElDZWhpdALriPyks9yrSiBxpsLdu\nq9rdm6Mm+mHzgCwlaKTH0GvQmU5R4PbbttLrOC5x81ILsmIgC4elEXHFayFPFR7X\ndtFQKa2tOGDmK6TmJv5TWiwEWRE81c6p9YjD/ih1AoGAUFxki+jhM2s4HTGiZQMs\nekDkDjesZioQvhqP0ugS/Tr3ec7Jwsku9rGZAY9TFN6DJ43DgoICA/GPXldhvGDc\nP3RXXlqtxTF+mBnmrR3ujpLI/eyp8Tz8gHb7SoQ+WUWMT16VOplNeOc/Wjwdmg6f\nCIurMXAxXb6xcSbEVTIarGU=\n-----END PRIVATE KEY-----\n
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