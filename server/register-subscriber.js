require('dotenv').config();
const { Novu } = require('@novu/node');
const novu = new Novu(process.env.NOVU_SECRET_KEY);

novu.subscribers.identify('faculty_001', {
    firstName: 'Robert',
    lastName: 'Fox',
    email: 'sakthikarthikbc@outlook.com',
}).then(() => {
    console.log('✅ Subscriber registered! Emails will be sent to sakthikarthikbc@outlook.com');
    process.exit();
}).catch(err => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
});
