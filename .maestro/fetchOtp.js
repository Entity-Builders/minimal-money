const testEmail = 'test-e2e@minimalmoney.com';
const mailboxUrl = `http://localhost:54324/api/v1/mailbox/${testEmail}`;

// Maestro JS execution: we can use the 'http' object
const response = http.get(mailboxUrl);
const messages = JSON.parse(response.body);

if (messages && messages.length > 0) {
    // Usually the newest message is first or last, let's just grab the last one (most recent)
    // Actually inbucket usually sorts newest first or last? It usually sorts newest first.
    const lastMessage = messages[0];
    const msgId = lastMessage.id;
    
    const msgResponse = http.get(`${mailboxUrl}/${msgId}`);
    const msgData = JSON.parse(msgResponse.body);
    
    // We expect the OTP to be in the subject or body.
    // The subject usually is "Tu código de PostalPeek" or similar, maybe the OTP is in the text.
    // In config.toml: subject = "Tu código de PostalPeek" (wait, minimal money uses the postalpeek template??)
    const bodyText = msgData.body.text || msgData.body.html || "";
    
    // Look for a 6 digit code
    const match = bodyText.match(/\b\d{6}\b/);
    if (match) {
        output.otp = match[0];
        console.log("OTP Found: " + output.otp);
    } else {
        console.log("No 6-digit code found in email body");
    }
} else {
    console.log("No emails found for " + testEmail);
}
