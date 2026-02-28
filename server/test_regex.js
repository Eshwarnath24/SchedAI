const emailRegex = /^([a-z0-9._%+-]+)@([a-z0-9.-]+)\.cb\.amrita$/;

const testEmails = [
    "suresh.kumar@cse.cb.amrita",
    "Name@CSE.cb.amrita", // Should fail regex but pass logic after toLowerCase()
    "invalid@gmail.com",
    "alice@mec.cb.amrita",
    "bob@cse.amrita.edu"
];

console.log("Testing Email Regex Logic:");
testEmails.forEach(email => {
    const normalized = email.toLowerCase();
    const match = normalized.match(emailRegex);
    if (match) {
        console.log(`PASS: ${email} -> Dept: ${match[2].toUpperCase()}`);
    } else {
        console.log(`FAIL: ${email}`);
    }
});
